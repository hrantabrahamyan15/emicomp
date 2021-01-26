import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-metamask-info',
  templateUrl: './metamask-info.component.html',
  styleUrls: ['./metamask-info.component.scss']
})
export class MetamaskInfoComponent implements OnInit {

  videoSource: any = {
    'ru': [
      {
        src: 'https://www.youtube.com/embed/Vj9ztSdKSPU',
        provider: 'youtube',
      },
    ],
    'en': [
      {
        src: 'https://www.youtube.com/embed/Vj9ztSdKSPU',
        provider: 'youtube',
      },
    ]
  };

  selectSource: string = 'en';

  constructor(public translate: TranslateService, @Inject(PLATFORM_ID) private platform: any) {
    this.selectSource = this.translate.currentLang === 'ru' ? 'ru' : 'en';
  }

  ngOnInit(): void {
  }

}
