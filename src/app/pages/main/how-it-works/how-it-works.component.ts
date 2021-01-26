import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SharedService} from "../../../@core/shared/shared.service";
import {AuthService} from "../../../@core/shared/auth.service";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Web3Service} from "../../../@core/shared/web3.service";

declare var gtag;

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements OnInit {
  @ViewChild('howitwork') howitWork: ElementRef;
  constructor(public sharedService: SharedService, public authService: AuthService,
              public router: Router, private translate: TranslateService,
              private web3: Web3Service) { }

  stats: any;

  async ngOnInit() {
    this.stats = await this.authService.getStats();
    this.sharedService.scrollEl.subscribe((el: HTMLElement) => {
      this.howitWork.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  get daiRate(): number {
    return this.web3.getDaiRate();
  }

  get usdcRate(): number {
    return this.web3.getUsdcRate();
  }

  get ethRate(): number {
    return this.web3.getEthRate();
  }

  get cUsdcRate(): number {
    return this.web3.getCUsdcRate();
  }

  get cDaiRate(): number {
    return this.web3.getCDaiRate();
  }

  get cEthRate(): number {
    return this.web3.getCEthRate();
  }

  get textWithApy() {
    return this.translate.instant('how_works.baks_deposit2').replace('%APY%', this.stats && this.stats.hasOwnProperty('currentAPY') ? (this.stats.currentAPY ? this.stats.currentAPY.toFixed(1) : '') : '');
  }

  goToAccount() {
    this.authService.gaEvent(gtag, 'account', 'use_supply_button', 'go to account page after Supply button');
    this.router.navigate(['/account'], { queryParams: { is_modal: true } });
  }

}
