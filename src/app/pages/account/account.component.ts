import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { Web3Service } from '../../@core/shared/web3.service';
import { SharedService } from '../../@core/shared/shared.service';
import { AuthService } from '../../@core/shared/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';

const moment = require('moment');

declare var gtag;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  @ViewChild('PartialWithdrawalTemp', { static: false })
  PartialWithdrawalTemp: any;
  @ViewChild('referalModal', { static: false })
  referalModalTemp: any;

  tokenInfo: any;
  profitInfo: any;

  notificationsUpdateWeb3: any;
  notificationsLoadWeb3: any;
  eth_address: string = null;

  modal: any;

  dialogRef: MatDialogRef<any>;

  constructor(
    public web3: Web3Service,
    public shared: SharedService,
    public authService: AuthService,
    public transalte: TranslateService,
    public dialogService: MatDialog,
    public activatedRoute: ActivatedRoute, private router: Router
  ) {}

  interval: any;
  lastTime: number;

  async calcProfit() {
    if(!this.tokenInfo) this.tokenInfo = await this.web3.tokenInfo();
    if(!this.profitInfo) this.profitInfo = await this.web3.dataProfit();

    const now = new Date().getTime();

    if (this.tokenInfo && this.tokenInfo.balance > 0) {
      if (now - this.lastTime > 15000) {
        this.lastTime = now;
        const profit = await this.web3.dataProfit();
        this.profitInfo = profit;

        this.tokenInfo = await this.web3.tokenInfo();
      }
      else {
        this.profitInfo.pendingUserProfit = this.profitInfo.pendingUserProfit + Math.random() * 0.00000000005;
      }
    }
  }

  async ngOnInit() {
    if(this.web3.isMetamaskDoNotExist) {
      await this.shared.showMetamaskInfo();
    }

    this.notificationsLoadWeb3 = this.web3.loadWalletData.subscribe(() => {
      if (!this.interval) {
        this.lastTime = (new Date()).getTime();
        this.interval = setInterval(this.calcProfit.bind(this), 500);
      }
    });

    this.notificationsUpdateWeb3 = this.web3.updateBalanceDai.subscribe(async () => {
      this.tokenInfo = null;
      this.profitInfo = null;

      this.calcProfit.bind(this);
    });

    if(this.web3.getAccount() != '') {
      if (!this.interval) {
        this.lastTime = (new Date()).getTime();
        this.interval = setInterval(this.calcProfit.bind(this), 500);
      }
    }
  }

  async claimProfit() {
    await this.shared.showModalAndGetEthAddress();
    return;
  }

  async callBuyTokensModal() {
    this.authService.gaEvent(gtag, 'balance', 'supply_dai', 'click button for deposit dai to balance');
    this.shared.modalBuyTokens();
  }

  recvProfit: number;

  async withdrawTokens() {
    this.authService.gaEvent(gtag, 'balance', 'withdraw_dai', 'click button for withdraw dai from balance');
    this.shared.modalBurnTokens();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.notificationsLoadWeb3) this.notificationsLoadWeb3.unsubscribe();
    if (this.notificationsUpdateWeb3) this.notificationsUpdateWeb3.unsubscribe();
  }

  calcInProcess: boolean = false;
  async calcRecvProfit() {
    if (this.calcInProcess) return;
    this.calcInProcess = true;
    this.recvProfit = 0;// this.authService.user.getWithdrawnProfit() || 0;
    try {
      let index = await this.web3.currencyContracts['dai'].tokenizedStrategy.methods.lastProfitDistIndex(this.web3.getAccount()).call();
      if (index !== 0) index--;
      let totalProfit = 0;
      for(;index > 0;index--) {
        const {totalLiquidity, totalSupplay}= await this.web3.currencyContracts['dai'].tokenizedStrategy.methods.userShare(this.web3.getAccount(), index).call();
        const dataProfit = await this.web3.currencyContracts['dai'].tokenizedStrategy.methods.profits(index).call();
        totalProfit += dataProfit.usdtProfit * totalLiquidity / totalSupplay / 10**6 + dataProfit.daiProfit * totalLiquidity / totalSupplay / 10**6;
        this.recvProfit = totalProfit;
      }
    }catch (e) {
      console.error(e);
    }

    this.calcInProcess = false;
  }

  isBalanceLoaded() {
    return this.tokenInfo && (this.tokenInfo.balance || this.tokenInfo.balance === 0);
  }
}
