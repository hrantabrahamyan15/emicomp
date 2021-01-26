import {Component, OnInit} from "@angular/core";
import {SharedService} from "../../../@core/shared/shared.service";


@Component({
  selector: 'app-termofuse',
  templateUrl: './termofuse.component.html',
  styleUrls: ['./termofuse.component.scss'],
})
export class TermofuseComponent implements OnInit{

  constructor(public shared: SharedService) {  }

  async ngOnInit() {}

}
