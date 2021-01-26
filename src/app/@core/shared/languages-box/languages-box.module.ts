import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LanguagesBoxComponent} from "./languages-box.component";
// import {TranslateModule} from "@ngx-translate/core";
import {MatMenuModule} from "@angular/material/menu";


@NgModule({
  declarations: [LanguagesBoxComponent],
  exports: [LanguagesBoxComponent],
  imports: [
    CommonModule,
    // TranslateModule,
    MatMenuModule
    // DropdownModule,
  ],
  providers: [],
  bootstrap: [LanguagesBoxComponent],
})
export class LanguagesBoxModule { }
