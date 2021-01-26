import { Component, OnInit } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../../@core/shared/auth.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(public translate: TranslateService, public authService: AuthService) { }

  ngOnInit(): void {
  }

}
