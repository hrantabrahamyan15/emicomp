import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService} from "../auth.service";

import {SharedService} from "../shared.service";
import {MatDialogRef} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {Web3Service} from "../web3.service";
import {environment} from "../../../../environments/environment";

declare var gtag;

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss']
})
export class WithdrawModalComponent implements OnInit, OnDestroy {


  eth_address: string;
  agreed: boolean = false;
  errorFormat: boolean = false;
  profit: any;

  work: any = {hash: '', status: 'done', type: ''};

  constructor(public authService: AuthService, private web3: Web3Service, private translate: TranslateService,
              public shared: SharedService, private activeModal: MatDialogRef<any>) {

  }

  interval: any;

  async checkWorkStatus() {
    if (this.work.status === 'pending') {
      const ret = await this.web3.getTrxStatus(this.work.hash);
      if (ret === 'done') {
        this.authService.gaEvent(gtag, 'transaction', 'complete_withdraw_profit', 'complete trx for withdraw profit', parseInt(((this.profit.daiProfit + this.profit.usdProfit) * 1000).toFixed(0)));
        this.web3.updateBalanceDai.next(true);
        this.work.status = 'done';
        this.activeModal.close();
      }
      else {
        switch (ret){
          case 'replaced':
            this.authService.gaEvent(gtag, 'transaction', 'complete_withdraw_profit', 'complete trx for withdraw profit', parseInt(((this.profit.daiProfit + this.profit.usdProfit) * 1000).toFixed(0)));
            this.web3.updateBalanceDai.next(true);
            this.work.status = 'done';
            this.activeModal.close();
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
    this.interval = setInterval(this.checkWorkStatus.bind(this), 7000);

    this.profit = await this.web3.dataProfit();
  }

  showRealProfitInfo() {
    if (!this.profit) return '';
    return this.translate.instant('messages.BLOCKCHAIN_PAYOUT')
      .replace('%PROFIT%', `${this.profit.daiProfit.toFixed(5)} DAI${parseFloat(this.profit.usdProfit.toFixed(5)) > 0 ? ' + ' + this.profit.usdProfit.toFixed(5) + ' USDT' : ''}`)
  }

  showRealProfitInfo2() {
    if (!this.profit || parseFloat(this.profit.pendingUserProfit.toFixed(5)) === 0) return '';
    return this.translate.instant('messages.BLOCKCHAIN_PAYOUT2')
      .replace('%PENDING_PROFIT%', `${this.profit.pendingUserProfit.toFixed(5)} DAI`);
  }

  realWithdrawInProcess: boolean = false;
  errorRealWithdraw: string;

  async withdrawRealOptimized(type: string = 'withdraw') {
    this.errorRealWithdraw = null;
    this.realWithdrawInProcess = true;
    try {
      const message = await this.web3.signMessage(`${environment.project.name} withdraw request`);
      const ret = await this.authService.requestRealProfitOptimized(message);
      const data = ret.data;

      const res: any = await this.web3.claimDepositProfit(data.currentIndex, data.lastIndex, data.totalUsdtProfit, data.totalDaiProfit, data.v, data.r, data.s, type === 'reinvest');
      if (res.result) {
        this.authService.gaEvent(gtag, 'transaction', 'start_withdraw_profit', 'send trx for withdraw profit', parseInt(((this.profit.daiProfit + this.profit.usdProfit) * 1000).toFixed(0)));
        this.work.hash = res.hash;
        this.work.description = this.translate.instant('messages.UNLOCKING_CURRENCY');
        this.work.status = 'pending';
        this.work.type = 'withdraw';
      }
      else {
        if (!res.isCancel) {
          this.shared.alertMsg(this.translate.instant('web3.error'), this.translate.instant(res.error).replaceAll('%FEE_AMOUNT%', res.fee));
        }
      }
    }
    catch (e) {
      console.error(e);
      if(!e.message.includes('User denied transaction signature') && !e.message.includes('User denied message signature')) {
        this.errorRealWithdraw = this.translate.instant('errors.transaction_unknown_error');
      }
    }
    this.realWithdrawInProcess = false;
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
