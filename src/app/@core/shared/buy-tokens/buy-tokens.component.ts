import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Web3Service} from "../web3.service";
import {environment} from "../../../../environments/environment";
import BigNumber from "bignumber.js";
import {AuthService} from "../auth.service";
import {TranslateService} from "@ngx-translate/core";
import {SharedService} from "../shared.service";

declare var gtag;

@Component({
  selector: 'app-buy-tokens',
  templateUrl: './buy-tokens.component.html',
  styleUrls: ['./buy-tokens.component.scss']
})
export class BuyTokensComponent implements OnInit, OnDestroy {

  changeForm: FormGroup;
  currencies: any[] = [{symbol: 'DAI',  address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18}];

  work: any = {hash: '', status: 'done', type: ''};

  state: string = 'unlock'; // 'unlock', 'buy'

  daiBalance: number = 0;
  daiToDeposit: number;

  trxFeeFirst: any = {min: 0, max: 0};
  trxFeeSecond: any = {min: 0, max: 0};

  constructor(private fb: FormBuilder, private web3: Web3Service, public authService: AuthService,
              public translate: TranslateService, public shared: SharedService) { }

  interval: any;

  async checkWorkStatus() {
    if (this.work.status === 'pending') {
      const ret = await this.web3.getTrxStatus(this.work.hash);
      if (ret === 'done') {
        this.work.status = 'done';
        if(this.work.type == 'supply'){
          this.authService.gaEvent(gtag, 'transaction', 'complete_deposit', 'complete trx for deposit dai', parseInt((this.daiToDeposit * 1000).toFixed(0)));
          this.daiBalance = await this.web3.getCurrecyBalance(this.web3.getAccount());
          this.web3.updateBalanceDai.next(true);
        }

        try {
          let {volume} = this.changeForm.value;
          this.state = new BigNumber(await this.web3.isTokenApproved('tokenizedStrategy')).isGreaterThanOrEqualTo(new BigNumber(volume)) ? 'buy'  : 'unlock';
        }catch (e) {
          console.error(e);
        }

      }
      else {
        switch (ret){
          case 'replaced':
            this.work.status = 'done';
            if(this.work.type == 'supply'){
              this.authService.gaEvent(gtag, 'transaction', 'complete_deposit', 'complete trx for deposit dai', parseInt((this.daiToDeposit * 1000).toFixed(0)));
              this.daiBalance = await this.web3.getCurrecyBalance(this.web3.getAccount());
              this.web3.updateBalanceDai.next(true);
            }

            try {
              let {volume} = this.changeForm.value;
              this.state = new BigNumber(await this.web3.isTokenApproved('tokenizedStrategy')).isGreaterThanOrEqualTo(new BigNumber(volume)) ? 'buy'  : 'unlock';
            }catch (e) {
              console.error(e);
            }
            break;
          case 'failed':
            this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.error_trx_processing'), 'The transaction ended with an error');
            this.work.status = 'done';
            break;
        }
      }
    }
  }

  async ngOnInit() {
    this.changeForm = this.fb.group({
      volume: new FormControl({value: 1, disabled: false}, [Validators.required]),
    });

    this.interval = setInterval(this.checkWorkStatus.bind(this), 7000);

    this.daiBalance = await this.web3.getCurrecyBalance(this.web3.getAccount());


    this.changeForm.controls.volume.valueChanges.subscribe(async (value) => {
      if (value) {
        value = new BigNumber(new BigNumber(value).toFixed(6, 1)).toNumber();
        this.changeForm.controls['volume'].setValue(value, { emitEvent: false });

        this.state = new BigNumber(await this.web3.isTokenApproved('tokenizedStrategy')).isGreaterThanOrEqualTo(new BigNumber(value)) ? 'buy'  : 'unlock';
      }
    });

    const approveAmount = await this.web3.isTokenApproved('tokenizedStrategy');
    this.state = new BigNumber(approveAmount).isGreaterThanOrEqualTo(new BigNumber(1)) ? 'buy'  : 'unlock';

    const minGasPrice = await this.web3.calcGasPrice('average');
    const maxGasPrice = await this.web3.calcGasPrice('fast');

    this.trxFeeFirst.min = new BigNumber(minGasPrice).div(10**18).multipliedBy(100000).multipliedBy(this.web3.getEthRate()).toFixed(0);
    this.trxFeeFirst.max = new BigNumber(maxGasPrice).div(10**18).multipliedBy(200000).multipliedBy(this.web3.getEthRate()).toFixed(0);

    this.trxFeeSecond.min = new BigNumber(minGasPrice).div(10**18).multipliedBy(1100000).multipliedBy(this.web3.getEthRate()).toFixed(0);
    this.trxFeeSecond.max = new BigNumber(maxGasPrice).div(10**18).multipliedBy(2000000).multipliedBy(this.web3.getEthRate()).toFixed(0);
  }

  maxValue() {
    this.changeForm.controls.volume.setValue(new BigNumber(new BigNumber(this.daiBalance).toFixed(6, 1)).toNumber());
  }

  async onSubmit() {
    let {volume} = this.changeForm.value;

    if(volume <= 0) {
      this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('burn_tokens.set_amount'));
      return;
    }

    volume = new BigNumber(new BigNumber(volume).toFixed(6, 1)).toNumber();
    this.daiToDeposit = volume;

    if (!(this.authService.user.ethAddresses || []).find((x)=>x.eth_address === this.web3.getAccount().toLowerCase())) {
      const message = await this.web3.signMessage(`${environment.project.name} address message`);
      await this.authService.confirmEthAddress(message);
    }

    if (!(new BigNumber(await this.web3.isTokenApproved('tokenizedStrategy')).isGreaterThanOrEqualTo(new BigNumber(volume)))) {
      const res: any = await this.web3.tokenApprove(-1);
      if (res.result) {
        this.work.hash = res.hash;
        this.work.description = this.translate.instant('messages.UNLOCKING_CURRENCY').replace('%CURRENCY%', this.currencies[0].symbol);
        this.work.status = 'pending';
        this.work.type = 'approve';
      }
      else {
        if(!res.isCancel) {
          this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant(res.error).replaceAll('%FEE_AMOUNT%', res.fee), res.error_desc ? res.error_desc : '');
        }
      }
    } else {
      const balance = await this.web3.getCurrecyBalance(this.web3.getAccount());
      if(balance < volume){
        this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('buy_tokens.invalid_balance'));
      }
      else {
        const res: any = await this.web3.buyTokens(volume, "0x0000000000000000000000000000000000000000");
        if (res.result) {
          this.authService.gaEvent(gtag, 'transaction', 'start_deposit', 'send trx for deposit dai', parseInt(new BigNumber(volume).div(10 ** (this.currencies[0].decimals - 3)).toFixed(0)));
          this.work.hash = res.hash;
          this.work.description = this.translate.instant('messages.BUYING_DDAY').replace('%CURRENCY%', this.currencies[0].symbol);
          this.work.status = 'pending';
          this.work.type = 'supply';
        }
        else {
          if(!res.isCancel) {
            this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant(res.error).replaceAll('%FEE_AMOUNT%', res.fee), res.error_desc ? res.error_desc : '');
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

}
