const https = require('https');
https.get('https://api.github.com/repos/amsyartownGH/Chrono-Bento/commits/902a84d05e3b4b4cf51ff89b4c9c531b5d5d3a04', {
  headers: { 'User-Agent': 'node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
