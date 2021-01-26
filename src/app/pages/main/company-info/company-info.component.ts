import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {SharedService} from "../../../@core/shared/shared.service";

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnInit {
  @ViewChild('teaminfo') teamInfo: ElementRef;
  constructor(public sharedService: SharedService) { }

  ngOnInit(): void {
    this.sharedService.scrollEl.subscribe((el: HTMLElement) => {
      this.teamInfo.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

}
