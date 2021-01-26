export class SocialLink {
  id: number;
  type: string;
  link: string;
  verified: boolean;
}

export class User {
  id: number;
  auth_code: string;
  email: string;
  email_confirmed: boolean;
  eth_address: string;
  is_admin: boolean;
  lang: string;
  phone: string;
  phone_confirmed: boolean;
  balance: any;
  telegram: string;
  telegram_confirmed: boolean;
  username: string;
  promo_balance: number;
  profit: number;
  walletType: string;
  telegram_code: string;
  social_confirmed: boolean;
  social_code: string;
  social_status: string;
  created_at: string;
  promoHasBeenActivated: boolean;
  ethAddresses: Array<any>;

  is_password: boolean;

  promopayments: Array<any> = [];
  pendingProfit: number;

  events: Array<any> = [];
  promocodes: Array<any> = [];

  isAllStepsDone() {
    return this.email_confirmed && this.phone_confirmed;
  }

  hasPromoProfit() {
    return (this.promopayments || []).find(x => x.status !== 'done');
  }

  getPromoHash() {
    return this.promopayments.length >0 && this.promopayments[0].hash;
  }

  isPromoApproved() {
    return this.promopayments.find((x)=>x.is_approved);
  }

  getPromoStatusWithApproved() {
    return this.promopayments.length >0 && (this.promopayments[0].status + (this.promopayments[0].is_approved ? '_approved' : ''));
  }

  getPromoStatus() {
    return this.promopayments.length >0 && this.promopayments[0].status;
  }

  isPromoRequested() {
    return !!(this.promopayments || []).find(x => x.status == 'requested');
  }

  getAddressFromPromoRequested() {
    const p = (this.promopayments || []).find(x => x.status == 'requested');
    if (!p) return '';
    return p.eth_address;
  }

  getPromoTokens() {
    const p = (this.promopayments || []).filter(x => x.status !== 'done' && (new Date(x.expireDate)).getTime() > (new Date()).getTime());
    if (p) return p.reduce((value, item)=>{return value + item.amount;}, 0);
    return 0;
  }

  getBurnPromoDate() {
    let target;
    for(let p of this.promopayments){
      if(!target || target < (new Date(p.expireDate)).getTime()) target = (new Date(p.expireDate)).getTime(); // + 14 * 24 * 60 * 60 * 1000;
    }
    return (new Date(target)).toLocaleDateString();
  }

  calcMaxPendingProfit() {
    let pendingProfit = 0;
    for(let p of this.promopayments) {
      if (p.status !== 'done') {
        let  maxTime = ((new Date(p.expireDate)).getTime() - (new Date(p.created_at)).getTime());
        pendingProfit += p.amount * (p.apy / 100) * (maxTime / 1000 / 60 / 60 / 24 / 365);
      }
    }
    return pendingProfit;
  }

  calcPendingProfit() {
    let pendingProfit = 0;

    for(let p of this.promopayments) {
      let now = (new Date()).getTime();
      if (p.status !== 'done') {
        const maxTime = (new Date(p.expireDate)).getTime();
        if (now > maxTime) now = maxTime;

        let diff = (now - (new Date(p.created_at)).getTime());
        pendingProfit += p.amount * (p.apy / 100) * (diff / 1000 / 60 / 60 / 24 / 365);
      }
    }
    return pendingProfit;
  }

  getWithdrawnProfit() {
    let sum = 0;
    for(let p of this.promopayments) {
      if (p.hash && p.profit > 0) sum += p.profit;
    }
    return sum;
  }

  calcPendingProfitExpire() {
    let countSeconds = 0;
    let now = (new Date()).getTime();
    for(let p of this.promopayments) {
      if (p.status !== 'done') {
        const maxTime = (new Date(p.expireDate)).getTime();
        if (now < maxTime) now = maxTime;

        let  diff = (now - (new Date()).getTime());
        countSeconds += diff;
      }
    }
    return parseInt((countSeconds / 1000).toFixed(0));
  }
}
