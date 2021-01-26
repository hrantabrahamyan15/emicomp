import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import {ThemeModule} from "../@theme/theme.module";
import {PagesRoutingModule} from "./pages-routing.module";
import { ContactsComponent } from './contacts/contacts.component';
import { MainComponent } from './main/main.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { FirstScreenComponent } from './main/first-screen/first-screen.component';
import { HowItWorksComponent } from './main/how-it-works/how-it-works.component';
import { WhyNeedComponent } from './main/why-need/why-need.component';
import { CompanyInfoComponent } from './main/company-info/company-info.component';
import {MatTabsModule} from "@angular/material/tabs";
import { AccountComponent } from './account/account.component';
import {CoreModule} from "../@core/core.module";
import {TermofuseComponent} from "./documents/termofuse/termofuse.component";
import {PrivacyPolicyComponent} from "./documents/privacy-policy/privacy-policy.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';



@NgModule({
  declarations: [PagesComponent, ContactsComponent, MainComponent, FirstScreenComponent, HowItWorksComponent, WhyNeedComponent, CompanyInfoComponent,
    AccountComponent, TermofuseComponent, PrivacyPolicyComponent],

  imports: [
    CommonModule,
    ThemeModule,
    PagesRoutingModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    CoreModule
  ],


})
export class PagesModule { }
