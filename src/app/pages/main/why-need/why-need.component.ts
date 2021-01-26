import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../../@core/shared/auth.service";
import {SharedService} from "../../../@core/shared/shared.service";

declare var gtag;

@Component({
  selector: 'app-why-need',
  templateUrl: './why-need.component.html',
  styleUrls: ['./why-need.component.scss']
})
export class WhyNeedComponent implements OnInit {

  constructor(public router: Router, public translate: TranslateService, public authService: AuthService,
              public sharedService: SharedService) { }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:typedef
  goToAccount() {
    this.authService.gaEvent(gtag, 'account', 'use_supply_button', 'go to account page after Supply button');
    this.router.navigate(['/account'], {queryParams: {is_modal: true}});
  }

}
