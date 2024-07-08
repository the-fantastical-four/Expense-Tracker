const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '../certs'); // Adjusted for the middlewares directory
const keyPath = path.join(certsDir, 'server.key');
const certPath = path.join(certsDir, 'server.crt');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = selfsigned.generate(attrs, { days: 365 });

  fs.writeFileSync(certPath, pems.cert);
  fs.writeFileSync(keyPath, pems.private);

  console.log('Certificates generated successfully');
} else {
  console.log('Certificates already exist');
}
