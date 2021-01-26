import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HeaderComponent } from './structure-components/header/header.component';
import {RouterModule} from "@angular/router";
import {LanguagesBoxModule} from "../@core/shared/languages-box/languages-box.module";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule} from "@angular/material/dialog";
import { FooterComponent } from './structure-components/footer/footer.component';
import {MatButtonModule} from "@angular/material/button";
import {CoreModule} from "../@core/core.module";
import {MatMenuModule} from "@angular/material/menu";



const COMPONENTS = [
  MainLayoutComponent
];

@NgModule({
  declarations: [...COMPONENTS, HeaderComponent, FooterComponent],
  exports: [...COMPONENTS],
  imports: [
    CommonModule,
    RouterModule,
    LanguagesBoxModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    CoreModule
  ]
})
export class ThemeModule { }
