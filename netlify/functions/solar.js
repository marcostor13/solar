const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const MONGO_URI = process.env.MONGO_URI;
const USER_EMAIL = process.env.USER_EMAIL;
const PASSWORD_EMAIL = process.env.PASSWORD_EMAIL;

let cachedClient = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGO_URI);
    await cachedClient.connect();
  }
  return cachedClient.db();
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
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

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('Error en handler:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
};

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
