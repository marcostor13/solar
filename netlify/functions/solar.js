const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
if (process.env.NODE_DNS_SERVERS) {
  dns.setServers(process.env.NODE_DNS_SERVERS.split(','));
}

const MONGO_URI = process.env.MONGO_URI;
const USER_EMAIL = process.env.USER_EMAIL;
const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URI);
    try {
      await cachedClient.connect();
    } catch (err) {
      cachedClient = null;
      throw err;
    }
  }
  return cachedClient.db();
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const key = params.key || '';
    const local = params.local || '';

    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || key !== adminKey) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No autorizado' }),
      };
    }

    if (!local) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Falta el parámetro local' }),
      };
    }

    try {
      const db = await getDb();
      const registrations = await db
        .collection('registrations')
        .find({ local })
        .sort({ createdAt: -1 })
        .toArray();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(registrations),
      };
    } catch (err) {
      console.error('Error GET registrations:', err.message);
      const code = err?.code ?? '';
      if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || err.message?.includes('querySrv')) {
        return {
          statusCode: 503,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'No se pudo conectar a la base de datos. Verifica el IP Whitelist en MongoDB Atlas.' }),
        };
      }
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Error al obtener datos' }),
      };
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'JSON inválido' }),
    };
  }

  const { name, email, address, phone, dateOfBirth, local, favoriteDrink } = body;

  if (!name || !email || !address || !phone || !dateOfBirth || !local) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Faltan campos requeridos' }),
    };
  }

  if (!MONGO_URI) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Variable MONGO_URI no configurada' }),
    };
  }

  try {
    const db = await getDb();
    const collection = db.collection('registrations');

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await collection.findOne({ email: normalizedEmail, local });
    if (existing) {
      return {
        statusCode: 409,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Ya existe un registro con este email para este evento' }),
      };
    }

    await collection.insertOne({
      name,
      email: normalizedEmail,
      address,
      phone,
      dateOfBirth,
      local,
      favoriteDrink: favoriteDrink || '',
      createdAt: new Date(),
    });

    await sendNotification({ name, email: normalizedEmail, phone, address, dateOfBirth, local, favoriteDrink });
    sendConfirmation({ name, email: normalizedEmail, local, favoriteDrink }).catch(() => {});

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    const code = err?.code ?? '';
    console.error('Error en handler:', err.message);

    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || err.message?.includes('querySrv')) {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No se pudo conectar a la base de datos. Verifica el IP Whitelist en MongoDB Atlas.' }),
      };
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};

const EVENT_LABELS = {
  'chivas-regal':           'Chivas Regal 18 — Dinner Christian Motte',
  'dinner-christian-motte': 'Dinner Christian Motte',
  'lila-takeover':          'Lila Takeover',
};

function eventLabel(local) {
  return EVENT_LABELS[local] || local.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function sendConfirmation(data) {
  if (!USER_EMAIL || !PASSWORD_EMAIL) return;

  const label = eventLabel(data.local);
  const logoUrl = 'https://graffiteria.gruposolar.pe/galery-garbo/casa.png';
  const guestRow = data.favoriteDrink
    ? `<tr>
         <td style="padding:10px 14px;border-top:1px solid rgba(157,94,246,0.15);color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:2px;text-transform:uppercase;white-space:nowrap">Invitado por</td>
         <td style="padding:10px 14px;border-top:1px solid rgba(157,94,246,0.15);color:#ffffff;font-size:14px">${data.favoriteDrink}</td>
       </tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 16px">
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#07031a;border-radius:16px;overflow:hidden;border:1px solid rgba(157,94,246,0.2)">

      <!-- logo header -->
      <tr>
        <td style="padding:36px 40px 28px;text-align:center;background:#0a041e">
          <img src="${logoUrl}" alt="Casa Garbo" height="56" style="display:block;margin:0 auto;max-width:180px;object-fit:contain">
        </td>
      </tr>

      <!-- purple divider -->
      <tr>
        <td style="height:1px;background:linear-gradient(90deg,transparent,#9d5ef6 50%,transparent)"></td>
      </tr>

      <!-- body -->
      <tr>
        <td style="padding:40px">

          <p style="margin:0 0 10px;color:rgba(255,255,255,0.4);font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase">Confirmación de registro</p>
          <h1 style="margin:0 0 6px;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:1px;line-height:1.1">${label.toUpperCase()}</h1>
          <p style="margin:0 0 36px;color:#9d5ef6;font-size:13px;font-weight:700;letter-spacing:4px">CASA GARBO</p>

          <p style="margin:0 0 32px;color:rgba(255,255,255,0.75);font-size:15px;line-height:1.8">
            Hola <strong style="color:#ffffff;font-weight:700">${data.name}</strong>,<br>
            tu registro ha sido confirmado.<br>
            <span style="color:rgba(255,255,255,0.55)">Te esperamos en Casa Garbo.</span>
          </p>

          <!-- detail table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(157,94,246,0.07);border:1px solid rgba(157,94,246,0.22);border-radius:10px;border-collapse:collapse;overflow:hidden;margin-bottom:36px">
            <tr>
              <td style="padding:10px 14px;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;border-bottom:1px solid rgba(157,94,246,0.15)">Nombre</td>
              <td style="padding:10px 14px;color:#ffffff;font-size:14px;border-bottom:1px solid rgba(157,94,246,0.15)">${data.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:rgba(255,255,255,0.45);font-size:11px;letter-spacing:2px;text-transform:uppercase;white-space:nowrap">Email</td>
              <td style="padding:10px 14px;color:#ffffff;font-size:14px">${data.email}</td>
            </tr>
            ${guestRow}
          </table>

          <!-- footer note -->
          <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;letter-spacing:2px;text-transform:uppercase;text-align:center">
            Casa Garbo &nbsp;·&nbsp; reservas@casagarbo.pe
          </p>

        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: USER_EMAIL, pass: PASSWORD_EMAIL },
    });

    await transporter.sendMail({
      from: `"Casa Garbo" <${USER_EMAIL}>`,
      to: data.email,
      subject: `Confirmación — ${label}`,
      html,
    });
  } catch (err) {
    console.error('Error enviando confirmación (no crítico):', err.message);
  }
}

async function sendNotification(data) {
  if (!USER_EMAIL || !PASSWORD_EMAIL) return;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: USER_EMAIL, pass: PASSWORD_EMAIL },
    });

    await transporter.sendMail({
      from: `"Solar Registros" <${USER_EMAIL}>`,
      to: USER_EMAIL,
      subject: `Nuevo registro: ${data.local}`,
      html: `
        <h2 style="color:#7c3aed">Nuevo registro — ${data.local}</h2>
        <table cellpadding="8" style="border-collapse:collapse">
          <tr><td><strong>Nombre</strong></td><td>${data.name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
          <tr><td><strong>Teléfono</strong></td><td>${data.phone}</td></tr>
          <tr><td><strong>Dirección</strong></td><td>${data.address}</td></tr>
          <tr><td><strong>Fecha de nacimiento</strong></td><td>${data.dateOfBirth}</td></tr>
          <tr><td><strong>Invitado por</strong></td><td>${data.favoriteDrink || '—'}</td></tr>
          <tr><td><strong>Fecha de registro</strong></td><td>${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}</td></tr>
        </table>
      `,
    });
  } catch (err) {
    console.error('Error enviando email (no crítico):', err.message);
  }
}
