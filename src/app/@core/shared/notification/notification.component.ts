import { Component, OnInit } from '@angular/core';
import {SharedService} from "../shared.service";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(public shared: SharedService) { }

  ngOnInit(): void {
  }

  closeNotify() {
    this.shared.dismissNotify.next();
  }

}
