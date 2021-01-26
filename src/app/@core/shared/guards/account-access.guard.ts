import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from "../auth.service";
import {delay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AccountAccessGuard implements CanActivate {
  constructor(private router: Router, public authService: AuthService) {}
 async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {


    // const promised = of().pipe(delay(1300)).toPromise();
    // let isAccountActivate;
    // await promised.then(async () => {
    // const user = await this.authService.waitForLogged();
    const isAccountActivate = true; // (user.email_confirmed && user.telegram_confirmed && user.eth_address !== null && user.phone_confirmed);
    // });
   if (isAccountActivate) {
     return true;
   } else {
     this.router.navigate(['/']);
     return false;
   }



   // console.log('dasdasdasdasd',  (this.authService.user.email_confirmed && this.authService.user.telegram_confirmed && this.authService.user.eth_address !== null && this.authService.user.phone_confirmed));








  }

}
