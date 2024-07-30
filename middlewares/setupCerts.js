const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// Directory where certificates will be stored
const certsDir = path.join(__dirname, '../certs');
// Paths for the private key and certificate files
const keyPath = path.join(certsDir, 'server.key');
const certPath = path.join(certsDir, 'server.crt');

// Function to generate certificates
function generateCertificates() {
  // Attributes for the certificate (common name)
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }];
  // Generate self-signed certificate and key pair
  const pems = selfsigned.generate(attrs, {
    keySize: 2048, // the size for the private key in bits
    days: 365, // expiry period for the signed certificate
    algorithm: 'sha256', // signing algorithm
  });

  // Write certificate to file
  fs.writeFileSync(certPath, pems.cert);
  // Write private key to file
  fs.writeFileSync(keyPath, pems.private);

  console.log('Certificates generated successfully');
}

// Check if certs directory exists, create if not
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Check if either key or cert file is missing, generate if needed
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  generateCertificates();
} else {
  console.log('Certificates already exist');
}