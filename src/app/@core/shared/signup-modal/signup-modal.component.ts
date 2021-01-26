import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SharedService} from "../shared.service";
import {environment} from "../../../../environments/environment";


@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.scss']
})
export class SignupModalComponent implements OnInit {

  email: string;

  constructor(public authService: AuthService, public router: Router,
              public dialogRef: MatDialogRef<SignupModalComponent>, private translate: TranslateService, private shared: SharedService) {
  }

  ngOnInit() {
  }

  async reg(){
    if (this.email) {
      const res: any = await this.authService.updateProfile({
        email: this.email,
        project: environment.project,
      });
      if (res.result || res.code === 'EMAIL_IN_USE') {

        if (res.code === 'EMAIL_IN_USE') {
          //
          this.shared.alertMsg(
            this.translate.instant('account_activate.confirm_email_msg_title'),
            this.translate
              .instant('account_activate.confirm_email_run_already')
              .replace('%EMAIL%', this.email)
          );
        } else {
          this.shared.alertMsg(
            this.translate.instant('account_activate.confirm_email_msg_title'),
            this.translate
              .instant('account_activate.confirm_email_run')
              .replace('%EMAIL%', this.email)
          );
          this.dialogRef.close();
        }
      } else {
        this.shared.alertMsg(
          this.translate.instant('account_activate.confirm_email_msg_title'),
          `${this.translate.instant(
            'phone_confirmed.error'
          )}. ${this.translate.instant(`server_errors.${res.code}`)}`
        );
      }
    } else {
      this.shared.alertMsg(
        this.translate.instant('account_activate.confirm_email_msg_title'),
        this.translate.instant('account_activate.confirm_email_require_email')
      );
    }
  }
}
