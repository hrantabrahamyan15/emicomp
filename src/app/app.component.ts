import {Component, OnInit} from '@angular/core';
import {AuthService} from "./@core/shared/auth.service";
import {NavigationEnd, Router} from "@angular/router";
import { filter } from 'rxjs/operators';

declare var gtag;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client';
  constructor(public authService: AuthService, private router: Router){
    const navEndEvents = router.events.pipe(
      filter(
        event => event instanceof NavigationEnd
      )
    );

    navEndEvents.subscribe(
      (event: NavigationEnd) => {
        gtag('config', 'UA-146884842-5', {
          page_path: event.urlAfterRedirects,
        });
      }
    );
  }
  async ngOnInit() {}
}
