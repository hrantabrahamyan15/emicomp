import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../@core/shared/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../@core/shared/shared.service';
import { Subject } from 'rxjs';

declare var gtag;

@Component({
  selector: 'app-first-screen',
  templateUrl: './first-screen.component.html',
  styleUrls: ['./first-screen.component.scss'],
})
export class FirstScreenComponent implements OnInit {
  @ViewChild("howItworksDialogTemplate") howItworksDialogTemplate: TemplateRef<any>;

  constructor(
    public dialogService: MatDialog,
    public authService: AuthService,
    public translate: TranslateService,
    public router: Router,
    public sharedService: SharedService
  ) {}

  email: string;

  async ngOnInit() {
    this.sharedService.scrollEl = new Subject<any>();
  }

  goToAccount(){
    this.authService.gaEvent(gtag, 'account', 'use_account_button', 'go to account page after Account button');
  }

  scroll(el: any) {
    this.sharedService.scrollEl.next(el);
  }

  callModalHowItWorks() {
    this.dialogService.open(this.howItworksDialogTemplate, {autoFocus: false, maxWidth: '800px'});
  }
}
