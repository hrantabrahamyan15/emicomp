const fs = require('fs');

(async ()=> {
  if (fs.existsSync('./src/assets/i18n/ru.json')) {
    console.log('Ru file is exist');
    let rawdata = fs.readFileSync('./src/assets/i18n/ru.json', 'utf8');
    const ruData = JSON.parse(rawdata);

    if (fs.existsSync('./src/assets/i18n/en.json')) {
      console.log('Checking En file');
      let rawEndata = fs.readFileSync('./src/assets/i18n/en.json', 'utf8');
      const enData = JSON.parse(rawEndata);

      for(let key of Object.keys(ruData)) {
        let value = ruData[key];

        if(enData.hasOwnProperty(key)){
          if(typeof(value) === 'object'){
            for(let keySecond of Object.keys(value)) {
              let valueSecond = value[key];

              if(!enData[key].hasOwnProperty(keySecond)){
                enData[key][keySecond] = valueSecond;
              }
            }
          }
        }
        else {
          enData[key] = value;
        }
      }

      fs.writeFileSync('./src/assets/i18n/en2.json', JSON.stringify(enData, null, "\t"));
    }
    else {
      console.log('En file is not found');
    }

    if (fs.existsSync('./src/assets/i18n/et.json')) {
      console.log('Checking Et file');

      let rawEtdata = fs.readFileSync('./src/assets/i18n/et.json', 'utf8');
      const etData = JSON.parse(rawEtdata);

      for(let key of Object.keys(ruData)) {
        let value = ruData[key];

        if(etData.hasOwnProperty(key)){
          if(typeof(value) === 'object'){
            for(let keySecond of Object.keys(value)) {
              let valueSecond = value[key];

              if(!etData[key].hasOwnProperty(keySecond)){
                etData[key][keySecond] = valueSecond;
              }
            }
          }
        }
        else {
          etData[key] = value;
        }
      }

      fs.writeFileSync('./src/assets/i18n/et2.json', JSON.stringify(etData, null, "\t"));
    }
    else {
      console.log('Et file is not found');
    }
  }
  else {
    console.log('Ru file is not found');
  }
})();
