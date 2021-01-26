import { Component, OnInit } from '@angular/core';
import {Web3Service} from "../web3.service";
import {MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../auth.service";
import BigNumber from "bignumber.js";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../../environments/environment";
import {SharedService} from "../shared.service";

declare var gtag;

@Component({
  selector: 'app-burn-tokens',
  templateUrl: './burn-tokens.component.html',
  styleUrls: ['./burn-tokens.component.scss']
})
export class BurnTokensComponent implements OnInit {

  flashLoanAmount: number;
  tokenInfo: any;

  work: any = {hash: '', status: 'done', type: ''};
  state: string = 'unlock'; // 'unlock', 'withdraw'

  steps = [];
  tokensToWithdraw: number;

  interval: any;

  constructor(public web3: Web3Service, private authService: AuthService, private translate: TranslateService,
              public dialogRef: MatDialogRef<BurnTokensComponent>, public shared: SharedService) { }

  async checkWorkStatus() {
    if (this.work.status === 'pending') {
      const ret = await this.web3.getTrxStatus(this.work.hash);
      if (ret === 'done') {
        this.work.status = 'done';
        if(this.work.type == 'withdraw'){
          this.authService.gaEvent(gtag, 'transaction', 'complete_withdraw', 'complete trx for withdraw dai', parseInt((this.tokensToWithdraw * 1000).toFixed(0)));
          this.web3.updateBalanceDai.next(true);
          this.dialogRef.close();
        }

        if(this.work.type == 'unlock'){
          this.steps = [];

          this.steps.push({
            title: this.translate.instant('account_page.get_out_tokens'),
            status: 'enabled',
            index: this.steps.length + 1,
            callfunction: this.withdraw.bind(this)
          });
        }
      }
      else {
        switch (ret){
          case 'replaced':
            this.work.status = 'done';
            if(this.work.type == 'withdraw'){
              this.authService.gaEvent(gtag, 'transaction', 'complete_withdraw', 'complete trx for withdraw dai', parseInt((this.tokensToWithdraw * 1000).toFixed(0)));
              this.web3.updateBalanceDai.next(true);
              this.dialogRef.close();
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
    this.flashLoanAmount = await this.web3.getCurrecyBalance(environment.dydxFlashLoanAddress);
    this.tokenInfo = await this.web3.tokenInfo();

    this.interval = setInterval(this.checkWorkStatus.bind(this), 7000);
  }

  maxValue(element: any) {
    element.value = new BigNumber(new BigNumber(this.tokenInfo.balance).toFixed(6, 1)).toNumber();
  }

  async approveDepositTokens() {
    try {
      const res: any = await this.web3.tokenApprove(-1);
      if(res.result){
        this.work.hash = res.hash;
        this.work.description = this.translate.instant('messages.UNLOCKING_CURRENCY');
        this.work.status = 'pending';
        this.work.type = 'unlock';
      }
      else {
        if(!res.isCancel) {
          this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant(res.error).replaceAll('%FEE_AMOUNT%', res.fee), res.error_desc ? res.error_desc : '');
        }
      }
    }
    catch (e){
      this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('errors.request_error'), e.message);
    }
  }

  async withdraw(){
    if(this.tokensToWithdraw) {
      // TODO: реализовать дешёвый вывод если возможно
      const res: any = await this.web3.burnTokens(this.tokensToWithdraw, "0x0000000000000000000000000000000000000000");
      if (res.result) {
        this.authService.gaEvent(gtag, 'transaction', 'start_withdraw', 'send trx for withdraw dai', parseInt((this.tokensToWithdraw * 1000).toFixed(0)));
        this.work.hash = res.hash;
        this.work.description = this.translate.instant('messages.UNLOCKING_CURRENCY');
        this.work.status = 'pending';
        this.work.type = 'withdraw';
      }
      else {
        if (!res.isCancel) {
          this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant(res.error).replaceAll('%FEE_AMOUNT%', res.fee), res.error_desc ? res.error_desc : '');
        }
      }
    }
  }

  async calcWithdraw(value: number) {
    if(!value){
      this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('burn_tokens.set_amount'));
    }
    else if(this.tokenInfo.balance < value){
      this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('burn_tokens.invalid_balance'));
    }
    else if(this.flashLoanAmount < value * 3){
      this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('burn_tokens.flash_loan_amount_invalid').replaceAll('%AMOUNT%', (this.flashLoanAmount/3).toFixed(2)));
    }
    else {

      this.steps = [];
      this.tokensToWithdraw = value;

      const isApproved = await this.web3.isTokenApproved('tokenizedStrategy');
      if (isApproved <= 0) {
        this.steps.push({
          title: this.translate.instant('account_page.buy_tokens_unlock'),
          status: 'disabled',
          index: this.steps.length + 1,
          callfunction: this.approveDepositTokens.bind(this)
        });

        this.steps.push({
          title: this.translate.instant('account_page.get_out_tokens'),
          status: 'disabled',
          index: this.steps.length + 1,
          callfunction: this.msgApproveTokens.bind(this)
        });
      }
      else {
        this.steps.push({
          title: this.translate.instant('account_page.get_out_tokens'),
          status: 'disabled',
          index: this.steps.length + 1,
          callfunction: this.withdraw.bind(this)
        });
      }

      this.steps[0].status = 'enabled';
    }
  }

  msgApproveTokens() {
    this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant('web3.need_approve_token'));
  }

  displayWithdrawDescription() {
    return this.translate.instant('burn_tokens.burn_description').replace('%AMOUNT%', this.tokensToWithdraw);
  }
}
