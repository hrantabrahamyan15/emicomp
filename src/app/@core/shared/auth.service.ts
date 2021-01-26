import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../../environments/environment";
import {Web3Service} from "./web3.service";
import {Subject} from "rxjs";
import {NotificationsService} from "./notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../classes/User";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public user: User;
  profileRequest: any;
  userStats: any = null;

  onUserLogged = new Subject();

  notificationsUpdateProfile: any;

  constructor(private http: HttpClient, public web3: Web3Service, private wsNotifications: NotificationsService,
              public translate: TranslateService) {

      // window['refreshProfile'] = () => { this.refreshProfile(); };

      this.getStats();
      this.refreshProfile();

      this.notificationsUpdateProfile = this.wsNotifications.userProfileChanges.subscribe({
        next: (data: any) => {
          this.refreshProfile();
  },
      });
  }

  gaEvent(gtag, ec: string, ea: string, el: string, ev: number = null) {
    if(environment.production && environment.gaActive) {
      let gaData = {
        'event_category': ec.toLowerCase(),
        'event_label': el.toLowerCase(),
      };

      if(ev){
        gaData['value'] = ev * 1000;
      }

      gtag('event', ea.toLowerCase(), gaData);
    }
  }


  public async waitForLogged() {
    const ret = await this.profileRequest;
    this.buildAUser(ret);
    return this.user;
  }

  isEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }


  // public async userProfile() {
  //   return await this.http.get(environment.server + '/profile', {withCredentials: true}).toPromise();
  // }

  public async refreshBalance() {
    if (this.user && this.user.eth_address) {
      try {
        this.user.balance = await this.web3.getBalance(this.user.eth_address);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public async refreshProfile(): Promise<any> {
    this.profileRequest =  this.loginByCode(); // this.http.get(environment.server + '/profile', {withCredentials: true}).toPromise();
    this.buildAUser(await this.profileRequest);
    return this.user;
  }

  private async buildAUser(httpRequestData: any) {
    if (httpRequestData && httpRequestData.success) {
      this.user = Object.assign(new User(), httpRequestData.data);

      console.log('buildAUser', this.user);

      localStorage.setItem('code', this.user.auth_code);

      this.user.walletType = localStorage.getItem('walletType');
      // рассчёт профита

      this.user.pendingProfit = 0;
      const now = (new Date()).getTime();
      for(let p of this.user.promopayments) {
        const diff = (now - (new Date(p.created_at)).getTime()) / 1000 / 60 / 60 / 24 / 365;
        this.user.pendingProfit += p.amount * (p.apy / 100) * diff;
      }

      try {
        this.wsNotifications.connect();
      }catch (e) {
        console.error(e);
      }

      if (this.user.eth_address) {
        this.web3.setAccount(this.user.eth_address);
        await this.refreshBalance();
      }

      this.onUserLogged.next(this.user);

      return true;
    }
  }

  async loginByCode(promocode = '') {
      const codeFromStorage = localStorage.getItem('code');
      const referralCodeFromStorage = localStorage.getItem('partner_code');
      let dataLogin = {};
      if (codeFromStorage) dataLogin['code'] = codeFromStorage;

      if (referralCodeFromStorage) {
        dataLogin['referralcode'] = codeFromStorage;
        localStorage.removeItem('partner_code');
      }

      if (promocode) {
        dataLogin['promocode'] = promocode;
      } else {
        const href = ((location  && location.href) || '').split('?promocode=');
        if (href && href.length == 2) {
          dataLogin['promocode'] = href[1];
        }
      }

      dataLogin['project'] = environment.project;

      return this.http.post(environment.server + '/loginByCode', dataLogin, {withCredentials: false}).toPromise();
  }

  async loginByEmail(email: string, password: string) {
    const res: any = await this.http.post(environment.server + '/loginByEmail',
      {email: email, password: password}, {withCredentials: false}).toPromise();

    if(res.success){
      localStorage.setItem('code', res.data.auth_code);
    }
    return res;
  }

  async regByEmail(email: string, password: string, promocode: string, code: string) {
    const res: any = await this.http.post(environment.server + '/regByEmail',
      {email: email, password: password, promocode: promocode, code : code}, {withCredentials: false}).toPromise();

    if(res.success){
      localStorage.setItem('code', res.data.auth_code);
    }
    return res;
  }

  async passwordRecover(email: string) {
    const res: any = await this.http.post(environment.server + '/recovePassword',
      {email: email, code : localStorage['code'], project: environment.project}, {withCredentials: false}).toPromise();

    return res;
  }

  async getProfileByCode(code: string){
    return await this.http.get(environment.server + `/profileByCode?code=${code}`, {withCredentials: false}).toPromise();
  }

  async confirmEthAddress(signMessage: string) {
    const requestBody = {signedMessage: signMessage, code : localStorage['code'], project: environment.project};

    let ret: any;
    try {
      ret = await this.http.post(environment.server + '/confirmEthAddress',
        requestBody, {withCredentials: true}).toPromise();
    } catch (e) {
      console.error(JSON.stringify(e));
    }

    if (ret.success) {
      await this.refreshProfile();
    }
    return {result: ret.success === true, msg: ret.code};
  }

  async requestPayment(eth_address: string) {
    const openedPromo = this.user.promopayments.find(x => x.status=='opened');
    if (!openedPromo) return {result: false, msg: 'PROMO_NOT_FOUND'};

    const ret: any = await this.http.post(environment.server + `/user/promopayment/request/${openedPromo.id}`, {eth_address: eth_address, code: localStorage['code']}, {withCredentials: true}).toPromise();

    if (ret.success) {
      this.profileRequest = this.loginByCode();
      this.buildAUser(await this.profileRequest);
    }

    return {result: ret.success === true, msg: ret.code};
  }

  async confirmEmail(code: string, email: string) {
    const requestBody = {code: code, email: email};

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    const ret: any = await this.http.post(environment.server + '/confirmEmail',
      requestBody,
      {withCredentials: true, headers: headers}
      ).toPromise();

    if (ret.data.auth_code) {
      localStorage['code'] = ret.data.auth_code;
    }
    if (ret.success) {
      this.profileRequest = this.loginByCode();
    }

    return {result: ret.success === true, msg: ret.code, data: ret.data};
  }

  async confirmPhone(tokenId: string) {
    const requestBody = {tokenId: tokenId, code: localStorage['code'], project: environment.project};

    const ret: any = await this.http.post(environment.server + '/verifyPhone',
      requestBody, {withCredentials: true}).toPromise();

    if (ret.data.auth_code) {
      localStorage['code'] = ret.data.auth_code;
    }

    if (ret.success) {
      this.profileRequest = this.loginByCode();
    }

    return {result: ret.success === true, msg: ret.code};
  }

  public async updateProfile(data: any) {
    data['code'] = localStorage['code'];
    const ret: any = await this.http.post(environment.server + '/updateProfile', data, {withCredentials: true}).toPromise();
    if (ret.success) {
      this.profileRequest = this.loginByCode();
    }
    return {result: ret.success === true, code: ret.code, data: ret.data};
  }

  public stats: any = {lastTime: 0, data: {}, p: null};

  public async getStats() {
    const now = (new Date()).getTime();
    if (now - this.stats.lastTime > 15000) {
      this.stats.p = this.http.get(environment.server + '/stats',  {withCredentials: false}).toPromise()
      this.stats.lastTime = now;
    }

    const ret: any = await this.stats.p;
    if (ret.success) {
     this.stats.data = ret.data;
    }
    return this.stats.data;
  }

  public async setUserLanguage(lang: string) {
    const ret: any = await this.http.post(environment.server + '/updateProfile',
      {
        lang: lang, code: localStorage['code']
      }, {withCredentials: true}).toPromise();

    if (ret.success) {
      this.profileRequest = this.loginByCode();
    }
  }

  public async requestRealProfitOptimized(message: string) {
    const ret: any = await this.http.post(environment.server + '/user/withdraw/profit',
      {signedMessage: message, code: localStorage['code'], project: environment.project},
      {withCredentials: true}).toPromise();
    return ret;
  }

}
