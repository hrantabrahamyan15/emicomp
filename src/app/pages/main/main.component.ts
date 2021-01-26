import { Component, OnInit, OnDestroy } from '@angular/core';
import {AuthService} from "../../@core/shared/auth.service";
import {Web3Service} from "../../@core/shared/web3.service";
import {SharedService} from "../../@core/shared/shared.service";
import {of, Subscription} from "rxjs";
import {delay} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
const moment = require('moment');

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  email: string;
  phone: string;

  emailCode: string;
  preloadPage: Promise<any>;

  tokenInfo: any;
  profitInfo: any;
  daiPrice: number;
  compPrice: number;

  notificationsLoadWeb3: any;

  eventSubscription: Subscription;

  constructor(public authService: AuthService, public web3: Web3Service, private shared: SharedService,
              private route: ActivatedRoute, private router: Router) {
    this.eventSubscription = this.route.queryParams.subscribe(async (params) => {
      if (params && params.hasOwnProperty('referral')) {
        localStorage.setItem('partner_code', params['referral']);
        this.router.navigate([], {
          queryParams: {
            referral: null,
          },
          queryParamsHandling: 'merge'
        });
      }
      if (params && params.hasOwnProperty('auth')) {
        const res: any = await this.authService.getProfileByCode(params['auth']);
        if(res.success) {
          const userInfo = res.data;
          if(userInfo.email_confirmed) {
            if (userInfo.is_password) {
              this.shared.modalAuthUsers('auth', userInfo.email);
            }
            else {
              this.shared.modalAuthUsers('reg', userInfo.email, params['auth']);
            }
          }
        }
        else {
          this.shared.modalAuthUsers('auth');
        }

        this.router.navigate([], {
          queryParams: {
            auth: null,
          },
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  async ngOnInit() {
    await this.authService.waitForLogged();
    this.preloadPage = of(true).pipe(delay(100)).toPromise();
  }

  ngOnDestroy() {
    if(this.eventSubscription) this.eventSubscription.unsubscribe();
  }
}
