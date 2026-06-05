const https = require('https');
const fs    = require('fs');
const path  = require('path');

const env = {};
fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const USER_EMAIL     = env.USER_EMAIL;
const PASSWORD_EMAIL = env.PASSWORD_EMAIL;

const TEST_RECIPIENTS = [
  { name: 'Nexos BTL',     email: 'nexosbtl@gmail.com' },
  { name: 'Marcos Torres', email: 'marcostor13@gmail.com' },
];

const logoUrl  = 'https://graffiteria.gruposolar.pe/dinner-christian-motte/logochivas.png';
const imageUrl = 'https://graffiteria.gruposolar.pe/dinner-christian-motte/flyer.jpeg';

function buildHtml(name) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px">
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#0d0710;border-radius:16px;overflow:hidden;border:1px solid rgba(184,134,11,0.3)">

      <tr>
        <td style="padding:36px 40px 24px;text-align:center;background:#080510">
          <img src="${logoUrl}" alt="Chivas Regal 18" height="52" style="display:block;margin:0 auto;max-width:160px;object-fit:contain">
        </td>
      </tr>

      <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#B8860B 50%,transparent)"></td></tr>

      <tr>
        <td style="padding:40px 40px 28px;text-align:center">
          <h1 style="margin:0 0 28px;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:0.5px;line-height:1.3">Tu invitaci&#243;n est&#225; confirmada. &#10022;</h1>
          <p style="margin:0;color:rgba(255,255,255,0.75);font-size:15px;line-height:1.8">
            Hola <strong style="color:#ffffff">${name}</strong>,<br>
            <span style="color:rgba(255,255,255,0.55)">te esperamos esta noche.</span>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:0;line-height:0">
          <img src="${imageUrl}" alt="Garbo Dinner" width="560" style="display:block;width:100%;max-width:560px;height:auto">
        </td>
      </tr>

      <tr>
        <td style="padding:36px 40px 40px;background:#0d0710;text-align:center">

          <p style="margin:0 0 6px;color:#B8860B;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Viernes 5 de junio</p>
          <p style="margin:0 0 28px;color:rgba(255,255,255,0.45);font-size:12px;letter-spacing:2px;text-transform:uppercase">Bajada de Ba&#241;os 340, Barranco</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:32px">
            <tr><td style="padding:14px 0;border-top:1px solid rgba(184,134,11,0.15);text-align:center">
              <span style="color:#B8860B;font-size:12px;font-weight:700;letter-spacing:3px">8:00 PM</span>
              <span style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 10px">&#8212;</span>
              <span style="color:rgba(255,255,255,0.8);font-size:13px">C&#243;ctel de bienvenida</span>
            </td></tr>
            <tr><td style="padding:14px 0;border-top:1px solid rgba(184,134,11,0.15);text-align:center">
              <span style="color:#B8860B;font-size:12px;font-weight:700;letter-spacing:3px">10:00 PM</span>
              <span style="color:rgba(255,255,255,0.3);font-size:11px;margin:0 10px">&#8212;</span>
              <span style="color:rgba(255,255,255,0.8);font-size:13px">La fiesta empieza</span>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px">
            <tr><td style="padding:10px 0;text-align:center">
              <span style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px">Dinner by</span>
              <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:1px">Christian Mott</span>
            </td></tr>
            <tr><td style="padding:10px 0;text-align:center">
              <span style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px">DJ</span>
              <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:1px">Alonso Valencia</span>
            </td></tr>
            <tr><td style="padding:10px 0;text-align:center">
              <span style="color:rgba(184,134,11,0.6);font-size:10px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px">Presentado por</span>
              <span style="color:#B8860B;font-size:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase">Chivas 18</span>
            </td></tr>
          </table>

        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function main() {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: '158.69.104.108',
    port: 465,
    secure: true,
    tls: { servername: 'mail.casagarbo.pe' },
    auth: { user: USER_EMAIL, pass: PASSWORD_EMAIL },
  });

  for (const r of TEST_RECIPIENTS) {
    try {
      await transporter.sendMail({
        from:    `"Chivas Regal Evento" <${USER_EMAIL}>`,
        to:      r.email,
        subject: 'Tu invitación está confirmada. ✦',
        html:    buildHtml(r.name),
      });
      console.log(`✓ Enviado a ${r.email}`);
    } catch (err) {
      console.error(`✗ Error enviando a ${r.email}:`, err.message);
    }
  }
}

main();
