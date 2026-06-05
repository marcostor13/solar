const https    = require('https');
const http     = require('http');
const { exec } = require('child_process');
const qs       = require('querystring');
const fs       = require('fs');
const path     = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const CLIENT_ID     = env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:3000/callback';
const SCOPE         = 'https://outlook.office.com/SMTP.Send offline_access';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n✗ Faltan OUTLOOK_CLIENT_ID y OUTLOOK_CLIENT_SECRET en el .env\n');
  process.exit(1);
}

const authUrl =
  `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&response_mode=query`;

console.log('\nAbriendo navegador para autorizar...\n');
exec(`start "" "${authUrl}"`);

const server = http.createServer((req, res) => {
  const url   = new URL(req.url, 'http://localhost:3000');
  const code  = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.writeHead(400); res.end(`Error: ${error}`);
    console.error('\n✗ Error de autorización:', url.searchParams.get('error_description'));
    server.close(); return;
  }
  if (!code) {
    res.writeHead(400); res.end('Sin código de autorización.');
    server.close(); return;
  }

  const postData = qs.stringify({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri:  REDIRECT_URI,
    grant_type:    'authorization_code',
  });

  const options = {
    hostname: 'login.microsoftonline.com',
    path:     '/consumers/oauth2/v2.0/token',
    method:   'POST',
    headers: {
      'Content-Type':   'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const tokenReq = https.request(options, tokenRes => {
    let body = '';
    tokenRes.on('data', chunk => body += chunk);
    tokenRes.on('end', () => {
      const tokens = JSON.parse(body);

      if (tokens.error) {
        res.writeHead(400);
        res.end(`Error: ${tokens.error_description}`);
        console.error('\n✗', tokens.error_description);
      } else {
        // Save refresh token to .env
        let envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('OUTLOOK_REFRESH_TOKEN=')) {
          envContent = envContent.replace(/OUTLOOK_REFRESH_TOKEN=.*/, `OUTLOOK_REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          envContent += `\nOUTLOOK_REFRESH_TOKEN=${tokens.refresh_token}`;
        }
        fs.writeFileSync(envPath, envContent);

        console.log('\n✓ Refresh token guardado en .env');
        console.log('\nYa puedes correr: node test-blast-email.js\n');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2 style="font-family:sans-serif">✓ Autorización completada. Puedes cerrar esta ventana.</h2>');
      }
      server.close();
    });
  });

  tokenReq.on('error', err => {
    console.error('\n✗ Error en request de token:', err.message);
    server.close();
  });

  tokenReq.write(postData);
  tokenReq.end();
});

server.listen(3000, () => {
  console.log('Esperando callback en http://localhost:3000/callback ...\n');
});
