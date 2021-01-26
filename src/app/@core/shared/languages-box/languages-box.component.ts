import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {Router, RouterState, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "../auth.service";
// import {AuthService} from "../auth.service";

@Component({
  selector: 'ngx-languages-box',
  templateUrl: './languages-box.component.html',
  styleUrls: ['./languages-box.component.scss'],
})
export class LanguagesBoxComponent implements OnInit {
  @ViewChild('menu', {static: true}) menu: ElementRef;

  currentLang = 'English';
  langArr = [
    {title: 'en', name: 'English', img: '/assets/img/en.svg'},
    {title: 'ru', name: 'Русский', img: '/assets/img/ru.svg'},
  ];
  urlParametr: object;

  constructor(public translate: TranslateService, private router: Router, public authService: AuthService) {





    const state: RouterState = router.routerState;
    const snapshot: RouterStateSnapshot = state.snapshot;
    this.urlParametr = snapshot.root.queryParams;





    translate.addLangs(['ru', 'en']);
    const language = localStorage.getItem('language');
    if (['ru', 'en'].indexOf(language) !== -1) {
      translate.setDefaultLang(language);
      this.currentLang = this.langArr.find((x) => x.title === language).name;
      this.translate.currentLang = language;
    } else {
      translate.setDefaultLang('en');
      this.translate.currentLang = 'en';
    }

  }


  ngOnInit() {
  }

  async changeLang(lang: string) {
    this.translate.currentLang = lang;
    // this.authService.browserLang = lang;
    this.translate.onLangChange.emit({lang: lang, translations: ''});
    localStorage.setItem('language', lang);
    this.translate.setDefaultLang(lang);
    await this.authService.setUserLanguage(lang);
  }

}
