import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import {MainComponent} from "./main/main.component";
import {AccountComponent} from "./account/account.component";
import {AccountAccessGuard} from "../@core/shared/guards/account-access.guard";


const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: '',
      component: MainComponent,
    },
    {
      path: 'account',
      component: AccountComponent,
      canActivate: [AccountAccessGuard],
    },
    {
      path: '**',
      redirectTo: '',
      pathMatch: 'full'
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
