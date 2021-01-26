import {Component, OnInit, ViewChild} from '@angular/core';
import {SharedService} from "../../../@core/shared/shared.service";
import {Web3Service} from "../../../@core/shared/web3.service";

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  @ViewChild("header", {static: false}) header: any;
  isFixed: boolean;
  viewMetamaskMsg: boolean = true;
  constructor(private shared: SharedService, public web3: Web3Service) { }

  ngOnInit(): void {
  }

  onScroll(e: any) {}

  async viewMetamaskInfo(){
    this.viewMetamaskMsg = false;
    await this.shared.showMetamaskInfo();
    this.viewMetamaskMsg = true;
  }
}
