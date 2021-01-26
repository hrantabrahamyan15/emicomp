import {Injectable} from '@angular/core';
// import {Subject} from 'rxjs/Subject';
import Ws from '@adonisjs/websocket-client';
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  private ws: any;
  private notifications: any;

  public saiRateChanges = new Subject();
  public wsClosed = new Subject();
  public depositStatusChanges = new Subject();
  public userProfileChanges = new Subject();

  private connected: boolean;

  constructor() {
    this.connected = false;
  }

  // private auth: AuthService
  connect() {
    if (this.ws) return;

    const pThis = this;
    // if (this.ws) this.ws.close();
    console.log('Connect via WS');
    const options = {query: {code : localStorage['code']}};
    // this.ws = (environment.production) ? Ws('ws://cbooster.df.help', options) : Ws('ws://localhost.loc:3333', options);
    this.ws = Ws('wss://defirex.org', options); //

    this.ws.connect();

    this.ws.on('open', () => {
      pThis.connected = true;
    });

    this.ws.on('close', () => {
      console.log('[WS]', "closed");
      // if connected before ?
      if (pThis.connected) this.wsClosed.next();

      pThis.connected = false;
      // setTimeout(this.connect.bind(this), 10000);
    });

    this.notifications = this.ws.subscribe('notifications');

    this.notifications.on('message', (value) => {
      console.info('[WS]', 'message', value);
      switch  (value.type) {
        case 'eth-sai-rate':
          {
            const rates = value.data;
            this.saiRateChanges.next(rates);
          }
          break;
        case 'deposit-open':
        case 'deposit-close':
          {
            this.depositStatusChanges.next(value.data);
          }
          break;
        case 'profile-update':
          {
            this.userProfileChanges.next(value.data);
          }
          break;
        default:
          console.log('UNKNOWN TYPE', value.type, value.data);
      }

    });

    // this.notifications.on('open', () => {
    //   console.log('opened!!!!!!');
    //   pThis.connected = true;
    // });

    this.notifications.on('error', (error) => {
      console.error('[WS]', error);
    });

    // this.notifications.on('close', () => {
    //
    // });
  }

}
