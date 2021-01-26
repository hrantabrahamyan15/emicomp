import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SharedService} from "../@core/shared/shared.service";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  @ViewChild('notificationTemplate', {static: false}) template:any;
  subscriptions: Subscription[];
  constructor(public shared: SharedService, private toastr: ToastrService) { }

  ngOnInit(): void {

    // setTimeout(() => {
    //   setInterval(() => {
    //     const randNum = Math.floor(Math.random() * 2);
    //     if (randNum > 0) {
    //       this.alertOne()
    //     } else {
    //       this.alertTwo()
    //     }
    //   }, 20000)
    //
    // }, 20000);
  }




  alertOne() {
    this.toastr.show(`
<div class="toast_box">
  <span>
    <img src="/assets/img/user_logo.svg" alt="">
    пользователь №${Math.floor(Math.random() * 1000)} 
    только что открыл депозит
  </span>
  <strong>
    <img src="/assets/img/fire.svg" alt="">
    Заработал + ${((Math.random() * 100) * 0.001).toFixed(4)}$ за 4 дня
  </strong>
</div>`, '', {
      extendedTimeOut: 3000,
      positionClass: 'toast-bottom-right',
      enableHtml: true,
      // toastClass: 'ngx-toastr',
      // tapToDismiss: true
      // tapToDismiss: true
    });
  }

  alertTwo() {
    this.toastr.show(`
<div class="toast_box">
  <span>
    <img src="/assets/img/user_logo.svg" alt="">
    пользователь №${Math.floor(Math.random() * 1000)} 
    вывел прибыль себе на кошелек
  </span>
  <strong>
    <img src="/assets/img/fire.svg" alt="">
    и уже заработал + ${((Math.random() * 100) * 0.001).toFixed(4)}$
  </strong>
</div>`, '', {
      extendedTimeOut: 3000,
      positionClass: 'toast-bottom-right',
      enableHtml: true,
      // toastClass: 'ngx-toastr',
      // tapToDismiss: true
      // tapToDismiss: true
    });
  }

  addNotify() {
    // let snackBarRef: any = this._snackBar.openFromComponent(NotificationComponent, {
    //   horizontalPosition: 'right',
    //   verticalPosition: 'bottom',
    //   panelClass: 'notify_custom'
    // });
  }

  removeAll() {

  }

}
