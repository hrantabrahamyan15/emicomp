// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  yaId: '',
  gaActive: false,
  server: 'https://defirex.org/api/v1',
  rpcUrl: 'https://mainnet.infura.io/v3/d95240f903b243bba4d0196aadf5ea13',

  project: {
    name: 'Emicomp',
    url: 'https://emicomp.emirex.com',
    support: 'emicomp@emirex.com'
  },

  gas_station_api_key: '5adcf0f05e63d66bc39bb556a85f7d6807ec34931d8d553854dd7bd41b2a',

  dateDepositRun: '2020-07-29 11:33:37 GMT+0300',

  dydxFlashLoanAddress: '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e'.toLowerCase(),
  questions_en: [
    // {q: 'Готовы ли Вы принимать участие в тестировании новых возможностей сервиса за пополнение баланса?', type: 'radio', a: ['Да', 'Нет']},
    {q: '1. Есть ли у вас криптокошелек Metamask?', type: 'radio', a: ['Да', 'Нет'], question_num: 1},
    {q: '2. Какие деньги вам хотелось бы внести? ', type: 'checkbox', a: [{name: 'Наличные', completed: false, quest: 5}, {name: 'Карта', completed: false, quest: 6}, {name: 'Безналичные на счету юридической фирмы', completed: false, quest: 7}, {name: 'Безналичные на счету ИП', completed: false, quest: 8}, {name: 'Криптовалюта на кошельке', completed: false, quest: 9}], question_num: 2},
    {q: '3. Есть ли аккаунт на Binance  или любой другой криптобирже?', type: 'radio', a: ['Да', 'Нет'], question_num: 3},
  ],
  questions_ru: [
    // {q: 'Готовы ли Вы принимать участие в тестировании новых возможностей сервиса за пополнение баланса?', type: 'radio', a: ['Да', 'Нет']},
    {q: '1. Есть ли у вас криптокошелек Metamask?', type: 'radio', a: ['Да', 'Нет'], question_num: 1},
    {q: '2. Какие деньги вам хотелось бы внести? ', type: 'checkbox', a: [{name: 'Наличные', completed: false, quest: 5}, {name: 'Карта', completed: false, quest: 6}, {name: 'Безналичные на счету юридической фирмы', completed: false, quest: 7}, {name: 'Безналичные на счету ИП', completed: false, quest: 8}, {name: 'Криптовалюта на кошельке', completed: false, quest: 9}], question_num: 2},
    {q: '3. Есть ли аккаунт на Binance  или любой другой криптобирже?', type: 'radio', a: ['Да', 'Нет'], question_num: 3},
  ],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
