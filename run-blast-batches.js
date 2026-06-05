/**
 * Blast por lotes con pausas entre cada lote.
 * - Lee progress de blast-progress.json y omite los ya enviados.
 * - Lotes de 80 correos, pausa de 4 minutos entre lotes.
 * - Se puede correr varias veces: siempre retoma donde se quedó.
 */
const nodemailer      = require('nodemailer');
const { MongoClient } = require('mongodb');
const dns  = require('dns');
const fs   = require('fs');
const path = require('path');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const envRaw = {};
fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) envRaw[k.trim()] = v.join('=').trim();
});

const MONGO_URI   = envRaw.MONGO_URI;
const SES_USER    = envRaw.SES_SMTP_USER;
const SES_PASS    = envRaw.SES_SMTP_PASS;
const FROM        = 'Chivas Regal Evento <reservas@casagarbo.pe>';
const BATCH_SIZE  = 50;
const PAUSE_MS    = 1000;
const PROGRESS_FILE = path.join(__dirname, 'blast-progress.json');

const logoUrl  = 'https://graffiteria.gruposolar.pe/dinner-christian-motte/logochivas.png';
const imageUrl = 'https://graffiteria.gruposolar.pe/dinner-christian-motte/flyer.jpeg';

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')));
  }
  return new Set();
}

function saveProgress(sent) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...sent]), 'utf8');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

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

function makeTransporter() {
  return nodemailer.createTransport({
    host: '52.206.145.59',
    port: 587,
    secure: false,
    tls: { servername: 'email-smtp.us-east-1.amazonaws.com' },
    auth: { user: SES_USER, pass: SES_PASS },
  });
}

async function main() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const all = await mongo.db().collection('registrations')
    .find({ local: 'chivas-regal' })
    .sort({ createdAt: 1 })
    .toArray();
  await mongo.close();

  const sentEmails = loadProgress();
  const pending    = all.filter(r => !sentEmails.has(r.email.toLowerCase()));

  console.log(`\nTotal registros  : ${all.length}`);
  console.log(`Ya enviados      : ${sentEmails.size}`);
  console.log(`Pendientes       : ${pending.length}`);
  console.log(`Lotes de ${BATCH_SIZE} con pausa de ${PAUSE_MS / 60000} min\n`);

  if (pending.length === 0) {
    console.log('✓ Todos los correos ya fueron enviados.');
    return;
  }

  let totalSent = sentEmails.size;
  let totalFailed = 0;
  const batchCount = Math.ceil(pending.length / BATCH_SIZE);

  for (let b = 0; b < batchCount; b++) {
    const batch = pending.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
    console.log(`\nLote ${b + 1}/${batchCount} — ${batch.length} correos`);

    let batchSent = 0, batchFailed = 0;
    const transporter = makeTransporter();

    for (const r of batch) {
      try {
        await transporter.sendMail({
          from:    FROM,
          to:      r.email,
          subject: 'Tu invitación está confirmada. ✦',
          html:    buildHtml(r.name),
        });
        sentEmails.add(r.email.toLowerCase());
        batchSent++;
        totalSent++;
      } catch (err) {
        batchFailed++;
        totalFailed++;
        console.log(`\n  ✗ ${r.email} — ${err.message.split('\n')[0]}`);
      }
      process.stdout.write(`\r  Progreso: ${batchSent + batchFailed}/${batch.length} | ✓ ${batchSent} | ✗ ${batchFailed}   `);
    }

    saveProgress(sentEmails);
    console.log(`\n  Lote ${b + 1} completo — ✓ ${batchSent} enviados, ✗ ${batchFailed} fallidos`);
    console.log(`  Acumulado: ✓ ${totalSent} enviados de ${all.length}`);

    if (b < batchCount - 1) {
      const mins = PAUSE_MS / 60000;
      console.log(`\n  Pausa de ${mins} minutos antes del siguiente lote...`);
      for (let s = Math.floor(PAUSE_MS / 1000); s > 0; s--) {
        process.stdout.write(`\r  Reanuda en ${s}s   `);
        await sleep(1000);
      }
      console.log('');
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`RESUMEN FINAL`);
  console.log(`✓ Enviados : ${totalSent}`);
  console.log(`✗ Fallidos : ${totalFailed}`);
  console.log(`  Total    : ${all.length}`);

  // Generar reporte Markdown
  const now     = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  const sentList = [...sentEmails].map((e, i) => `| ${i + 1} | ${e} | ✓ Enviado |`).join('\n');
  const failedList = all
    .filter(r => !sentEmails.has(r.email.toLowerCase()))
    .map((r, i) => `| ${i + 1} | ${r.name} | ${r.email} | ✗ No enviado |`)
    .join('\n');

  const md = `# Blast Email — Chivas Regal Evento
## Reporte de envío

**Fecha:** ${now}
**Evento:** Chivas Regal 18 — Garbo Dinner, Viernes 5 de junio
**Remitente:** Chivas Regal Evento <reservas@casagarbo.pe>

---

## Resumen

| Estado | Cantidad |
|--------|----------|
| ✓ Enviados | ${totalSent} |
| ✗ Fallidos | ${totalFailed} |
| **Total** | **${all.length}** |

---

## Enviados (${totalSent})

| # | Email | Estado |
|---|-------|--------|
${sentList}

${totalFailed > 0 ? `---

## No enviados (${totalFailed})

| # | Nombre | Email | Estado |
|---|--------|-------|--------|
${failedList}
` : ''}
---
*Generado automáticamente por el blast script*
`;

  const reportPath = path.join(__dirname, 'blast-report.md');
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`\n✓ Reporte guardado en blast-report.md`);

  if (totalFailed > 0) {
    console.log(`\nPara reintentar fallidos, vuelve a correr: node run-blast-batches.js`);
  } else {
    console.log('\n✓ Todos los correos fueron enviados exitosamente.');
  }
}

main().catch(console.error);
