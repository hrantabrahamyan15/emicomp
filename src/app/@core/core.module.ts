import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {TranslateModule} from "@ngx-translate/core";
import {PlyrModule} from "ngx-plyr";
import {AlertDialogComponent} from "./shared/alert-dialog/alert-dialog.component";
import {PrivateKeyModalComponent} from "./shared/private-key/private-key-modal.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {BurnTokensComponent} from "./shared/burn-tokens/burn-tokens.component";
import { BuyTokensComponent } from './shared/buy-tokens/buy-tokens.component';
import {MatSelectModule} from "@angular/material/select";
import { StatisticsComponent } from './shared/statistics/statistics.component';
import { WithdrawModalComponent } from './shared/withdraw-modal/withdraw-modal.component';
import { NotificationComponent } from './shared/notification/notification.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AuthModalComponent} from "./shared/auth-modal/auth-modal.component";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {SignupModalComponent} from "./shared/signup-modal/signup-modal.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MetamaskInfoComponent} from "./shared/metamask-info/metamask-info.component";



@NgModule({
  declarations: [AlertDialogComponent,
    PrivateKeyModalComponent, AuthModalComponent, BurnTokensComponent,
    BuyTokensComponent, StatisticsComponent, WithdrawModalComponent,
    NotificationComponent, SignupModalComponent, MetamaskInfoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule,
    TranslateModule,
    PlyrModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  exports: [StatisticsComponent],
  providers: [NgbActiveModal]
})
export class CoreModule { }
