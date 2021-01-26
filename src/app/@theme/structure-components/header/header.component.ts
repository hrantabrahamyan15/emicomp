import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../../@core/shared/shared.service';
import { AuthService } from '../../../@core/shared/auth.service';
import { Router } from '@angular/router';
import { Web3Service } from '../../../@core/shared/web3.service';

declare var gtag;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('aboutDialogTemplate') aboutDialogTemplate: TemplateRef<any>;
  @ViewChild('teamTemplate') teamTemplate: TemplateRef<any>;

  connectStatus: string = 'Connect';
  connectEvent: any;
  isSendEventConnected: boolean = false;

  constructor(
    public dialogService: MatDialog,
    private shared: SharedService,
    public authService: AuthService,
    public web3: Web3Service,
    public router: Router
  ) {}

  ngOnInit(): void {
    if (
      this.web3.getTypeWallet() === 'metamask' &&
      this.web3.getAccount() != ''
    ) {
      this.connectStatus = 'Connected';
      if (!this.isSendEventConnected) {
        this.authService.gaEvent(
          gtag,
          'wallet',
          'connected',
          'connected to metamask'
        );
        this.isSendEventConnected = true;
      }
    }

    this.connectEvent = this.web3.loadWalletData.subscribe({
      next: () => {
        if (
          this.web3.getTypeWallet() === 'metamask' &&
          this.web3.getAccount() != ''
        ) {
          this.connectStatus = 'Connected';
          if (!this.isSendEventConnected) {
            this.authService.gaEvent(
              gtag,
              'wallet',
              'connected',
              'connected to metamask'
            );
            this.isSendEventConnected = true;
          }
        }
      },
    });
  }

  async connectMetamask() {
    if (this.connectStatus != 'Connected') {
      if (await this.web3.useMetaMask()) {
        this.connectStatus = 'Connected';
        if (!this.isSendEventConnected) {
          this.authService.gaEvent(
            gtag,
            'wallet',
            'connected',
            'connected to metamask'
          );
          this.isSendEventConnected = true;
        }
      }
    } else {
      this.router.navigate(['account']);
    }
  }

  openAuthDialog() {
    this.shared.modalAuthUsers();
  }

  openSignupDialog() {
    this.shared.modalSignupUsers();
  }

  openDashboard() {
    this.router.navigate(['account']);
  }

  ngOnDestroy() {
    if (this.connectEvent) this.connectEvent.unsubscribe();
  }
}
