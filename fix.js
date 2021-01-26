const fs = require('fs');

try {
  const content = fs.readFileSync('./node_modules/swarm-js/node_modules/got/index.js').toString();
  fs.writeFileSync('./node_modules/swarm-js/node_modules/got/index.js', content.replace(`require('./package')`, `{name:'123', version: 1}`));
}catch (e) {
  console.error(e);
}
