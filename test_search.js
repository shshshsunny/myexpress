const http = require('http');

const url = 'http://localhost:3000/api/search?name=戰神';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', (e) => {
  console.error('Request error', e.message);
});
