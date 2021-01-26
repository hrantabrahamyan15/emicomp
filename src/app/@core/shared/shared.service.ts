import {Injectable} from '@angular/core';
import {AlertDialogComponent} from "./alert-dialog/alert-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {BurnTokensComponent} from "./burn-tokens/burn-tokens.component";
import {BuyTokensComponent} from "./buy-tokens/buy-tokens.component";
import {WithdrawModalComponent} from "./withdraw-modal/withdraw-modal.component";
import {Subject} from "rxjs";
import {AuthModalComponent} from "./auth-modal/auth-modal.component";
import {SignupModalComponent} from "./signup-modal/signup-modal.component";
import {MetamaskInfoComponent} from "./metamask-info/metamask-info.component";

@Injectable({
  providedIn: 'root',
})
export class SharedService  {

  dismissNotify: Subject<any> = new Subject<any>();
  scrollEl: Subject<any>;
  constructor(private dialogService: MatDialog) {}

  alertMsg(title: string, text: string, description: string = '') {
    return new Promise((resolve) => {
      const modalRef: any = this.dialogService.open(AlertDialogComponent,
        {
          data: {title: title, text: text, description: description}, minWidth: '400px', maxWidth: '400px'
        }
      );
      modalRef.afterClosed().subscribe((result) => {resolve(result); });
    });
  }

  showModalAndGetEthAddress(): Promise<any> {
    return new Promise((resolve) => {
      const modalRef: any = this.dialogService.open(WithdrawModalComponent, {minWidth: '400px', maxWidth: '400px'});
      modalRef.afterClosed().subscribe((data) => {
        resolve(data);
      });
    });
  }

  modalBurnTokens() {
    this.dialogService.open(BurnTokensComponent, {minWidth: '400px', maxWidth: '400px'});
  }

  modalBuyTokens() {
    this.dialogService.open(BuyTokensComponent, {minWidth: '400px', maxWidth: '400px'});
  }

  modalAuthUsers(type: string = 'auth', email: string = null, code: string = null) {
    this.dialogService.open(AuthModalComponent,
      {
        data: {type: type, email: email, code: code}, minWidth: '400px', maxWidth: '400px'
      });
  }

  modalSignupUsers() {
    this.dialogService.open(SignupModalComponent, {minWidth: '400px', maxWidth: '400px'});
  }

  showMetamaskInfo() {
    return new Promise((resolve) => {
      const modalRef: any = this.dialogService.open(MetamaskInfoComponent,
        {
          minWidth: '300px', maxWidth: '700px'
        }
      );
      modalRef.afterClosed().subscribe((result) => {resolve(result); });
    });
  }
}
