import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import Web3 from 'web3';
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../environments/environment";
import BigNumber from "bignumber.js";
import {HttpClient} from "@angular/common/http";
import {SharedService} from "./shared.service";
import {Subject} from "rxjs";
const moment = require('moment');
import {MatDialog} from "@angular/material/dialog";
import {isPlatformBrowser} from "@angular/common";

const Tx = require('ethereumjs-tx').Transaction;

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  public web3: any;

  private typeWallet: string;

  public isMetamaskDoNotExist: boolean;

  private defaultAccount: any = null;

  public rateChanges = new Subject();
  public loadWalletData = new Subject();

  public updateBalanceDai = new Subject();

  private ethRate: number = 0;
  private daiRate: number = 0;
  private usdcRate: number = 0;

  private cEthRate: number = 0;
  private cDaiRate: number = 0;
  private cUsdcRate: number = 0;

  public getAccount(): string {
    return (this.defaultAccount || '').toLowerCase();
  }

  public async updateAccount(): Promise<string> {
    if(this.isMetamaskDoNotExist){
      return '';
    }

    const defaultAccounts = await this.web3.eth.getAccounts();
    if (defaultAccounts.length === 0) {
      this.sharedService.alertMsg('', await this.translate.get('web3.not_found_metamask_accounts').toPromise());
      throw new Error();
    } else {
      this.defaultAccount = defaultAccounts[0];
    }
    this.loadWalletData.next();
    return this.defaultAccount;
  }

  public setAccount(address: string) {
    if (!this.isMetamaskDoNotExist && this.web3.utils.isAddress(address)) {
      this.defaultAccount = address;
    }
  }

  public getTypeWallet(): string {
    return this.typeWallet;
  }

  currencyContracts: any = {}; // 'dai': {'tokenizedStrategy': null, 'depositContract': null, 'depositTokenContract': null}


  constructor(public translate: TranslateService, private http: HttpClient, private dialogService: MatDialog,
              public sharedService: SharedService, @Inject(PLATFORM_ID) private platform: any) {


    if (!isPlatformBrowser(this.platform)) return;

    this.web3 = new Web3();
    this.typeWallet = localStorage.getItem('walletType');
    this.isMetamaskDoNotExist = (typeof window['ethereum'] === 'undefined' || (typeof window['web3'] === 'undefined'));

    this.useMetaMask();
    this.setCurrencyRate();
  }

  async isTokenApproved(contract, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      return 0;
    }

    try {
      if(currency.toLowerCase() !== 'eth') {
        return new BigNumber(await this.currencyContracts[currency.toLowerCase()]['tokenContract'].methods.allowance(this.defaultAccount, this.currencyContracts[currency.toLowerCase()][contract].options.address).call()).div(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toNumber();
      }
      else {
        return await this.getBalance(this.defaultAccount);
      }
    }
    catch (e){
      return 0;
    }
  }

  async tokenApprove(amount: number, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return {result: false, isCancel: true};
    }

    const amountApprove = amount === -1 ? '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' : new BigNumber(amount).multipliedBy(10 ** 18).toFixed(0);

    const gasPrice = await this.calcGasPrice('fast');

    let estimateGas;
    try {
      estimateGas = await this.web3.eth.estimateGas({
        from: this.web3.utils.toChecksumAddress(this.defaultAccount),
        to: this.web3.utils.toChecksumAddress(this.currencyContracts[currency.toLowerCase()]['tokenContract'].options.address),
        value: new BigNumber(0).multipliedBy(10 ** 18).toString(),
        data: this.currencyContracts[currency.toLowerCase()]['tokenContract'].methods.approve(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address, amountApprove).encodeABI(),
        gasPrice: gasPrice
      });

      if (estimateGas > 9000000) {
        return {result: false, error: 'web3.error_trx_processing', error_desc: 'The estimated amount of gas to complete the transaction exceeds the established limits.'};
      }

      const balance = new BigNumber(await this.getBalance(this.defaultAccount));
      if(balance.isLessThan(new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18))) {
        return {result: false, error: 'web3.error_trx_processing_low_balance', fee: new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18).toFixed(4)};
      }
    }
    catch (e){
      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {
        this.currencyContracts[currency.toLowerCase()]['tokenContract'].methods.approve(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address, amountApprove).send(
          {from: this.defaultAccount, gasPrice: gasPrice},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));
    } catch (e) {
      if(e.message.includes('User denied transaction signature')) {
        return {result: false, isCancel: true};
      }

      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    return {result: true, hash: hash};
  }

  async addUserStrategyDeposit(amount: number | string, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return {result: false, isCancel: true};
    }

    amount = new BigNumber(amount).multipliedBy(10 ** 18).toFixed(0);

    const gasPrice = await this.calcGasPrice('average');

    let estimateGas;
    try {
      estimateGas = await this.web3.eth.estimateGas({
        from: this.web3.utils.toChecksumAddress(this.defaultAccount),
        to: this.web3.utils.toChecksumAddress(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address),
        value: 0,
        gasPrice: gasPrice,
        data: this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.addUserStrategyDeposit(amount).encodeABI(),
      });

      if (estimateGas > 9000000) {
        return {result: false, error: 'web3.error_trx_processing', error_desc: 'The estimated amount of gas to complete the transaction exceeds the established limits.'};
      }

      const balance = new BigNumber(await this.getBalance(this.defaultAccount));
      if(balance.isLessThan(new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18))) {
        return {result: false, error: 'web3.error_trx_processing_low_balance', fee: new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18).toFixed(4)};
      }
    }
    catch (e){
      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {
        this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.addUserStrategyDeposit(amount).send(
          {from: this.defaultAccount, gasPrice: gasPrice},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));
    } catch (e) {
      if(e.message.includes('User denied transaction signature')) {
        return {result: false, isCancel: true};
      }

      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    return {result: true, hash: hash};
  }

  async daiApprove(amount: number, toAddress: string) {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return false;
    }

    const ammountApprove = amount === -1 ? '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF' : new BigNumber(amount).multipliedBy(10 ** 18).toFixed(0);

    const etimateGas = await this.web3.eth.estimateGas({
      from: this.web3.utils.toChecksumAddress(this.defaultAccount),
      to: this.web3.utils.toChecksumAddress(this.currencyContracts['dai']['tokenContract'].options.address),
      value: new BigNumber(0).multipliedBy(10 ** 18).toString(),
      data: this.currencyContracts['dai']['tokenContract'].methods.approve(toAddress, ammountApprove).encodeABI(),
    });

    if (etimateGas > 9000000) {
      return false;
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {
        this.currencyContracts['dai']['tokenContract'].methods.approve(toAddress, ammountApprove).send(
          {from: this.defaultAccount},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));
    } catch (e) {
      if (e.message.includes('User denied transaction signature')) {
      }
      return false;
    }

    return hash;
  }

  async getCurrecyBalance(address: string, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      return 0;
    }

    try {
      let res = 0;
      if(currency === 'eth'){
        res = new BigNumber(await this.web3.eth.getBalance(address)).div(10**18).toNumber();
      }
      else {
        res = new BigNumber(await this.currencyContracts[currency]['tokenContract'].methods.balanceOf(address).call()).div(10**this.currencyContracts[currency]['decimal']).toNumber();
      }
      return res;
    } catch (err) {
      return 0;
    }
  }

  async useMetaMask() {
    try {
      const provider = ('ethereum' in window) ? window['ethereum'] : Web3.givenProvider;
      this.web3 = new Web3(provider);

      const ret: any = await this.http.get('/assets/data/currencys.json', {withCredentials: true}).toPromise();
      for(let cur of ret.currencys){

        this.currencyContracts[cur.name.toLowerCase()] = {
          'decimal': cur.decimal,
          'tokenizedStrategy': new this.web3.eth.Contract(cur.tokenizedStrategyAbi, cur.tokenizedStrategy),
          'depositTokenContract': new this.web3.eth.Contract(cur.depositTokenAbi, cur.depositTokenAddress),
          'depositContract': new this.web3.eth.Contract(cur.dfDepositAbi, cur.dfDepositAddress),
          'dfInfo': new this.web3.eth.Contract(cur.dfInfoAbi, cur.dfInfoAddress),
          tokenizedStrategyAddress: cur.tokenizedStrategy
        };

        if (cur.name.toLowerCase() != 'eth') this.currencyContracts[cur.name.toLowerCase()]['tokenContract'] = new this.web3.eth.Contract(cur.abi, cur.address);
      }

    } catch (err) {
      console.error(err);
      this.sharedService.alertMsg('', await this.translate.get('web3.non_ethereum_browser_detected').toPromise());
      return false;
    }

    if (window['ethereum'] && window['ethereum']['enable']) await window['ethereum']['enable']();

    try {
      await this.updateAccount();
    } catch (e) {
      return false;
    }

    localStorage.setItem('walletType', 'metamask');
    this.typeWallet = 'metamask';
    return true;
  }

  async setCurrencyRate() {
    const resEth: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').toPromise();
    if(resEth.ethereum) {
      this.ethRate = new BigNumber(resEth.ethereum.usd).toNumber();
    }

    const resDai: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=usd').toPromise();
    if(resDai.dai) {
      this.daiRate = new BigNumber(resDai.dai.usd).toNumber();
    }

    const resUsdc: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd').toPromise();
    if(resUsdc.hasOwnProperty('usd-coin')) {
      this.usdcRate = new BigNumber(resUsdc['usd-coin'].usd).toNumber();
    }

    const resCEth: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=compound-ether&vs_currencies=usd').toPromise();
    if(resCEth.hasOwnProperty('compound-ether')) {
      this.cEthRate = new BigNumber(resCEth['compound-ether'].usd).toNumber();
    }

    const resCDai: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=cdai&vs_currencies=usd').toPromise();
    if(resCDai.hasOwnProperty('cdai')) {
      this.cDaiRate = new BigNumber(resCDai['cdai'].usd).toNumber();
    }

    const resCUsdc: any = await this.http.get('https://api.coingecko.com/api/v3/simple/price?ids=compound-usd-coin&vs_currencies=usd').toPromise();
    if(resCUsdc.hasOwnProperty('compound-usd-coin')) {
      this.cUsdcRate = new BigNumber(resCUsdc['compound-usd-coin'].usd).toNumber();
    }
  }

  public getEthRate() : number{
    return this.ethRate;
  }

  public getDaiRate() : number{
    return this.daiRate;
  }

  public getUsdcRate() : number{
    return this.usdcRate;
  }

  public getCEthRate() : number{
    return this.cEthRate;
  }

  public getCDaiRate() : number{
    return this.cDaiRate;
  }

  public getCUsdcRate() : number{
    return this.cUsdcRate;
  }


  async signMessage(msg: string) {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return '';
    }

    if (!this.defaultAccount) {
      await this.updateAccount();
    }
    return await this.web3.eth.personal.sign(this.web3.utils.utf8ToHex(msg), this.defaultAccount, '');
  }

  async getTokenInfo(eth_address: string, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return null;
    }

    return await this.currencyContracts[currency.toLowerCase()]['depositTokenContract'].methods.info(eth_address).call();
  }

  async getBalance(address: string) {
    try {
      const balance: number = (await this.web3.eth.getBalance(address)) as any;
      return new BigNumber(balance).div(10 ** 18).toNumber();
    } catch (err) {
      return 0;
    }
  }

  async getDTokenBalance(eth_address: string, currency: string = 'dai') {
    try {
      return await this.currencyContracts[currency.toLowerCase()]['depositTokenContract'].methods.balanceOf(eth_address).call() * 1;
    } catch (err) {
      return 0;
    }
  }

  async getTransactionReceipt(hash: string) {
    try {
      return await this.web3.eth.getTransactionReceipt(hash);
    } catch (err) {
      console.log('error receipt', err);
      return {status: false};
    }
  }

  async getTrxStatus(hash) {
    try {
      const trxInfo = await this.web3.eth.getTransactionReceipt(hash);
      if (!trxInfo) {
        const trx = await this.web3.eth.getTransaction(hash);
        return trx ? 'pending' : 'replaced';
      } else {
        return trxInfo.status ? 'done' : 'failed';
      }
    } catch(err){
      return 'pending';
    }
  }

  async buyTokens(amount, flashloanFromAddress: string = "0x0000000000000000000000000000000000000000", currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return {result: false, isCancel: true};
    }

    const tokenContract = this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'];

    const gasPrice = await this.calcGasPrice('fast');

    let estimateGas;
    try {
      estimateGas = await this.web3.eth.estimateGas({
        from: this.web3.utils.toChecksumAddress(this.defaultAccount),
        to: this.web3.utils.toChecksumAddress(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address),
        value: new BigNumber(currency != 'eth' ? 0 : amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0),
        data: tokenContract.methods.deposit(
          currency === 'dai' ? new BigNumber(amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0) : '0',
          currency === 'usdc' ? new BigNumber(amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0) : '0',
          this.web3.utils.toChecksumAddress(flashloanFromAddress)).encodeABI(),
        gasPrice: gasPrice,
      });

      if (estimateGas > 9000000) {
        return {result: false, error: 'web3.error_trx_processing', error_desc: 'The estimated amount of gas to complete the transaction exceeds the established limits.'};
      }

      const balance = new BigNumber(await this.getBalance(this.defaultAccount));
      if(balance.isLessThan(new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18))) {
        return {result: false, error: 'web3.error_trx_processing_low_balance', fee: new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18).toFixed(4)};
      }
    }
    catch (e) {
      console.log(`Deposit exception: ${e}`);
      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {

        tokenContract.methods.deposit(
          currency === 'dai' ? new BigNumber(amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0) : '0',
          currency === 'usdc' ? new BigNumber(amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0) : '0',
          this.web3.utils.toChecksumAddress(flashloanFromAddress)).send(
          {from: this.defaultAccount, gasPrice: gasPrice, gas: new BigNumber(estimateGas*1.2).toFixed(0), value: new BigNumber(currency != 'eth' ? 0 : amount).multipliedBy(10 ** this.currencyContracts[currency.toLowerCase()]['decimal']).toFixed(0)},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));
    } catch (e) {
      if(e.message.includes('User denied transaction signature')) {
        return {result: false, isCancel: true};
      }

      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    return {result: true, hash: hash};
  }

  async getTransaction(hash: string) {
    try {
      return await this.web3.eth.getTransaction(hash);
    } catch (err) {
      console.log('error receipt', err);
      return {status: false};
    }
  }

  // fast, average
  // Это должна быть единая точка входа для получения цены за 1 ед газа
  mapForGasPrice: any;
  async calcGasPrice(speed) {
    const now = (new Date()).getTime();
    if (!this.mapForGasPrice) this.mapForGasPrice = {};
    const cache = this.mapForGasPrice[speed];
    if (cache && (now - cache.lastTime) < 15000) return cache.value;

    let gasPrice;
    try {
      const gasPriceData: any = await this.http.get(`https://ethgasstation.info/api/ethgasAPI.json?api-key=${environment.gas_station_api_key}`).toPromise();
      if (gasPriceData[speed]) gasPrice =  new BigNumber(gasPriceData[speed]).multipliedBy(10 ** 8).toFixed(0);
    } catch (e) {
      console.error('cant calculate gas price', e);
    }

    if (!gasPrice) gasPrice =  new BigNumber(await this.web3.eth.getGasPrice()).toFixed(0);

    this.mapForGasPrice[speed] = {lastTime: now, value: gasPrice};
    return gasPrice;
  }

  public intgerToBytes32(cupInteger) {
    let ret = cupInteger.toString(16);
    while (ret.length < 64) ret = '0' + ret;
    return '0x' + ret;
  }

  public USD_TOKEN_DECIMALS = 6;

  compRate: number;
  saiRateLastUpdate: number = 0;

  setRates(data: any) {
    this.compRate = data.comp;
    this.saiRateLastUpdate = (new Date()).getTime();
    this.rateChanges.next(data);
  }

  async getCompRate() {
    const now = (new Date()).getTime();
    if (now - this.saiRateLastUpdate < 20 * 1000 && this.compRate) return this.compRate;
    try {
      this.saiRateLastUpdate = now;
      const ret: any = await this.http.get(environment.server + `/currency-rates`, {withCredentials: false}).toPromise();
      if (!ret.success) throw new Error();
      this.setRates(ret.data);
    } catch (e) {
      // TODO: что-нибудь придумать, хотя по идее сюда не должны попадать
      throw new Error(e);
    }
    return this.compRate;
  }

  async claimDepositProfit(currentIndex: number, lastIndex: number, totalUsdtProfit: number, totalDaiProfit: number, v: number, r: string, s: number, isReinvest: boolean, currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return {result: false, isCancel: true};
    }

    if(!this.defaultAccount) return {result: false, error: 'web3.user_address_not_exist'};

    let gasPrice = parseInt(await this.calcGasPrice('average'));

    let estimateGas;
    try {
      estimateGas = await this.web3.eth.estimateGas({
        from: this.web3.utils.toChecksumAddress(this.defaultAccount),
        to: this.web3.utils.toChecksumAddress(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address),
        value: new BigNumber(0).multipliedBy(10 ** 18).toString(),
        data: this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.userClaimProfitOptimized(
          new BigNumber(currentIndex).toString(),
          new BigNumber(lastIndex).toString(),
          new BigNumber(totalUsdtProfit).toString(),
          new BigNumber(totalDaiProfit).toString(),
          v,
          r,
          s,
          isReinvest
        ).encodeABI(),
        gasPrice: gasPrice,
      });

      if (estimateGas > 9000000) {
        return {result: false, error: 'web3.error_trx_processing', error_desc: 'The estimated amount of gas to complete the transaction exceeds the established limits.'};
      }

      const balance = new BigNumber(await this.getBalance(this.defaultAccount));
      if(balance.isLessThan(new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18))) {
        return {result: false, error: 'web3.error_trx_processing_low_balance', fee: new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18).toFixed(4)};
      }
    }
    catch (e) {
      console.log(e);
      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {
        this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.userClaimProfitOptimized(
          new BigNumber(currentIndex).toString(),
          new BigNumber(lastIndex).toString(),
          new BigNumber(totalUsdtProfit).toString(),
          new BigNumber(totalDaiProfit).toString(),
          v,
          r,
          s,
          isReinvest
        ).send(
          {from: this.defaultAccount, gasLimit: new BigNumber(estimateGas).multipliedBy(1.3).toFixed(0)},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));

      return {result: true, hash: hash};

    }
    catch (e){
      if(e.message.includes('User denied transaction signature')) {
        return {result: false, isCancel: true};
      }

      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }
  }

  async burnTokens(amount: number, flashLoanFromAddress: string = "0x0000000000000000000000000000000000000000", currency: string = 'dai') {
    if(this.isMetamaskDoNotExist){
      this.sharedService.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.metamask_info_panel_text1'));
      return {result: false, isCancel: true};
    }

    if(!this.defaultAccount) return {result: false, error: 'web3.user_address_not_exist'};

    let gasPrice = await this.calcGasPrice('average');

    let estimateGas;
    try {
      estimateGas = await this.web3.eth.estimateGas({
        from: this.web3.utils.toChecksumAddress(this.defaultAccount),
        to: this.web3.utils.toChecksumAddress(this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].options.address),
        value: new BigNumber(0).multipliedBy(10 ** 18).toString(),
        data: this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.burnTokens(
          currency === 'dai' ? new BigNumber(amount).multipliedBy(10 ** 18).toString() : 0,
          currency === 'usdc' ? new BigNumber(amount).multipliedBy(10 ** 6).toString()  : 0,
          currency === 'eth' ? new BigNumber(amount).multipliedBy(10 ** 18).toString()  : 0,
          flashLoanFromAddress
        ).encodeABI(),
        gasPrice: gasPrice,
      });

      if (estimateGas > 9000000) {
        return {result: false, error: 'web3.error_trx_processing', error_desc: 'The estimated amount of gas to complete the transaction exceeds the established limits.'};
      }

      const balance = new BigNumber(await this.getBalance(this.defaultAccount));
      if(balance.isLessThan(new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18))) {
        return {result: false, error: 'web3.error_trx_processing_low_balance', fee: new BigNumber(gasPrice).multipliedBy(estimateGas).div(10 ** 18).toFixed(4)};
      }
    }
    catch (e){
      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }

    let hash;
    try {
      hash = await (new Promise((resolve, reject) => {
        this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.burnTokens(
          currency === 'dai' ? new BigNumber(amount).multipliedBy(10 ** 18).toString()  : 0,
          currency === 'usdc' ? new BigNumber(amount).multipliedBy(10 ** 6).toString()  : 0,
          currency === 'eth' ? new BigNumber(amount).multipliedBy(10 ** 18).toString()  : 0,
          flashLoanFromAddress
        ).send(
          {from: this.defaultAccount, gasLimit: new BigNumber(estimateGas).multipliedBy(1.3).toFixed(0)},
          function (error, transactionHash) {
            if (error)
              reject(error);
            else
              resolve(transactionHash);
          });
      }));

      return {result: true, hash: hash};

    }
    catch (e){
      if(e.message.includes('User denied transaction signature')) {
        return {result: false, isCancel: true};
      }

      return {result: false, error: 'web3.error_trx_processing', error_desc: e.message};
    }
  }

  async tokenInfo(currency: string = 'dai') {
    const data = { balance: 0, lockedBalance: 0, expiredTime: 0, totalDeposit: 0, totalClaimed: 0, totalProfit: 0};
    try {
      if(this.defaultAccount) {
        const balance = await this.currencyContracts[currency.toLowerCase()]['depositTokenContract'].methods.balanceOf(this.defaultAccount).call();

        data.balance = new BigNumber(balance).div(10**this.currencyContracts[currency.toLowerCase()]['decimal']).toNumber();

        const dfWallet    = await this.currencyContracts[currency.toLowerCase()]['tokenizedStrategy'].methods.dfWallet().call();

        const depositInfo = await this.currencyContracts[currency.toLowerCase()]['depositContract'].methods.wallets(dfWallet).call();

        data.totalDeposit = new BigNumber(depositInfo[`deposit${currency === 'dai' ? '' : currency.toUpperCase()}`]).div(10**this.currencyContracts[currency.toLowerCase()]['decimal']).toNumber();
        data.totalClaimed = new BigNumber(depositInfo.compClaimed).div(10**18).toNumber();

        const res = await this.currencyContracts[currency.toLowerCase()]['depositContract'].methods.getCompBalanceMetadataExt(dfWallet).call();
        data.totalProfit = new BigNumber(res.balance).plus(new BigNumber(res.allocated)).div(10**18).toNumber();
      }
    }
    catch (e){
      console.log(e);
    }
    return data;
  }

  async dataProfit(currencys: string[] = ['dai']) {
    const data = { daiProfit: 0, usdProfit: 0, pendingUserProfit: 0};
    try {
      if(this.defaultAccount) {
        const compRate = await this.getCompRate();

        // Вычисляем общий профит
        const dfWallet = await this.currencyContracts[currencys[0].toLowerCase()]['tokenizedStrategy'].methods.dfWallet().call();
        const totalCompsData = await this.currencyContracts[currencys[0].toLowerCase()]['depositContract'].methods.getCompBalanceMetadataExt(dfWallet).call();
        const totalComps = new BigNumber(totalCompsData.balance).plus(totalCompsData.allocated).dividedBy(10**18);

        const pendingProfitInUSD = totalComps.multipliedBy(compRate).toNumber();

        let userBalance = 0;
        let totalSupplay = 0;
        for(let c of currencys){
          userBalance = userBalance + new BigNumber(await this.currencyContracts[c.toLowerCase()]['depositTokenContract'].methods.balanceOf(this.defaultAccount).call()).dividedBy(10**18).toNumber();
          totalSupplay = totalSupplay + new BigNumber(await this.currencyContracts[c.toLowerCase()]['depositTokenContract'].methods.totalSupply().call()).dividedBy(10**18).toNumber();
        }


        const profit = await this.currencyContracts[currencys[0].toLowerCase()]['tokenizedStrategy'].methods.calcUserProfit(this.defaultAccount, '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF').call();

        data.daiProfit = new BigNumber(profit.totalDaiProfit).div(10**18).toNumber();
        data.usdProfit = new BigNumber(profit.totalUsdtProfit).div(10**6).toNumber();
        data.pendingUserProfit = pendingProfitInUSD * userBalance / totalSupplay;
      }
    }
    catch (e){
      console.log(e);
    }

    return data;
  }
}
