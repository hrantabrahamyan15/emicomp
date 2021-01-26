import {Component, OnInit, Inject} from '@angular/core';
import {AuthService} from "../auth.service";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SharedService} from "../shared.service";

export interface DialogData {
  type: string;
  email: string;
  code: string;
}

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {
  type: string = 'auth';
  error: string = '';
  code: string = '';

  email: string = '';
  password: string = '';
  repeatpassword: string = '';
  promocode: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public authService: AuthService, public router: Router,
              public dialogRef: MatDialogRef<AuthModalComponent>, private translate: TranslateService, private shared: SharedService) {
    this.type = data.type;

    if(data.email != null) this.email = data.email;
    if(data.code != null) this.code = data.code;
  }

  ngOnInit() {
  }

  async auth(){
    this.error = '';
    if(this.email.trim().length != 0 && this.password.trim().length != 0) {
      const res: any = await this.authService.loginByEmail(this.email.trim(), this.password.trim());
      if (res.success) {
        localStorage.setItem('code', res.data.auth_code);
        await this.authService.refreshProfile();
        this.dialogRef.close();
      }
      else {
        this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`server_errors.${res.code}`)}`;
      }
    }
    else {
      this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`auth.field_require`)}`;
    }
  }

  async reg(){
    this.error = '';

    if(this.email.trim().length > 0 && this.password.trim().length > 0 && this.repeatpassword.trim().length > 0) {
      if(this.password != this.repeatpassword){
        this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`auth.pass_no_equal`)}`;
      }
      else {
        if(this.password.trim().length < 6){
          this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`auth.pass_no_min_len`)}`;
        }
        else {
          const res: any = await this.authService.regByEmail(this.email.trim(), this.password.trim(), this.promocode.trim(), this.code.trim());
          if (res.success) {
            localStorage.setItem('code', res.data.auth_code);
            await this.authService.refreshProfile();
            this.shared.alertMsg(this.translate.instant('auth.modal_title'), this.translate.instant('auth.create_success_password'));
            this.dialogRef.close();
          }
          else {
            this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`server_errors.${res.code}`)}`;
          }
        }
      }
    }
    else {
      this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`auth.field_require`)}`;
    }
  }

  async recover(){
    this.error = '';

    if(this.email.trim().length > 0) {
      const res: any = await this.authService.passwordRecover(this.email.trim());
      if (res.success) {
        this.shared.alertMsg(this.translate.instant('auth.modal_title'), this.translate.instant('account_activate.confirm_email_run').replace('%EMAIL%', this.email));
        this.dialogRef.close();
      }
      else {
        this.error = `${this.translate.instant('phone_confirmed.error')}. ${res.code ? this.translate.instant(`server_errors.${res.code}`) : ''}`;
      }
    }
    else {
      this.error = `${this.translate.instant('phone_confirmed.error')}. ${this.translate.instant(`auth.email`)}`;
    }
  }
}
