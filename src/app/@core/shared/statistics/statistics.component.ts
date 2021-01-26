import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {TranslateService} from "@ngx-translate/core";
import {Web3Service} from "../web3.service";
import {SharedService} from "../shared.service";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  realProfit: number = 0;

  constructor(public authService: AuthService, public transalte: TranslateService,
              private web3: Web3Service, public shared: SharedService) { }

  stats: any;


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

  async ngOnInit() {
    await this.authService.waitForLogged();

    this.stats = await this.authService.getStats();
    if(this.stats) {
      this.realProfit = this.stats.totalProfit;
    }
  }

  ngOnDestroy(): void {}

}
