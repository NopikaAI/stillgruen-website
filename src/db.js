// Speichert Anfragen in MySQL (Hostinger-Datenbank). Ohne Zugangsdaten: Datei data/anfragen.jsonl als Notlösung.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

let pool = null;
const FILE = path.join(__dirname, '..', 'data', 'anfragen.jsonl');
// Hostinger legt beim Verbinden einer Datenbank teils eigene Variablennamen an, daher mehrere Schreibweisen.
const env = (...keys) => keys.map((k) => process.env[k]).find((v) => v);
const cfg = () => ({
  host: env('DB_HOST', 'DATABASE_HOST', 'MYSQL_HOST') || 'localhost',
  port: Number(env('DB_PORT', 'DATABASE_PORT', 'MYSQL_PORT') || 3306),
  user: env('DB_USER', 'DB_USERNAME', 'DATABASE_USER', 'DATABASE_USERNAME', 'MYSQL_USER'),
  password: env('DB_PASSWORD', 'DB_PASS', 'DATABASE_PASSWORD', 'MYSQL_PASSWORD'),
  database: env('DB_NAME', 'DB_DATABASE', 'DATABASE_NAME', 'MYSQL_DATABASE'),
});
const enabled = () => { const c = cfg(); return !!(c.user && c.database); };

async function init() {
  if (!enabled()) {
    console.warn('Keine Datenbank konfiguriert, Anfragen werden in data/anfragen.jsonl gespeichert.');
    return;
  }
  pool = mysql.createPool({
    ...cfg(),
    connectionLimit: 3,
    charset: 'utf8mb4',
  });
  await pool.query(`CREATE TABLE IF NOT EXISTS anfragen (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    erstellt_am DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    telefon VARCHAR(40) NULL,
    friedhof VARCHAR(160) NULL,
    grabart VARCHAR(40) NOT NULL,
    leistung VARCHAR(60) NOT NULL,
    nachricht TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'neu'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  console.log('Datenbank verbunden.');
}

async function saveAnfrage(a) {
  if (pool) {
    await pool.execute(
      'INSERT INTO anfragen (name, email, telefon, friedhof, grabart, leistung, nachricht) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [a.name, a.email, a.telefon || null, a.friedhof || null, a.grabart, a.leistung, a.nachricht || null],
    );
    return true;
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.appendFileSync(FILE, JSON.stringify({ erstellt_am: new Date().toISOString(), status: 'neu', ...a }) + '\n');
  return true;
}

async function list(limit = 300) {
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM anfragen ORDER BY id DESC LIMIT ?', [limit]);
    return rows;
  }
  if (!fs.existsSync(FILE)) return [];
  return fs.readFileSync(FILE, 'utf8').trim().split('\n').filter(Boolean).map((l, i) => ({ id: i + 1, ...JSON.parse(l) })).reverse().slice(0, limit);
}

async function setStatus(id, status) {
  if (!pool) return false;
  await pool.execute('UPDATE anfragen SET status = ? WHERE id = ?', [status, id]);
  return true;
}

async function remove(id) {
  if (!pool) return false;
  await pool.execute('DELETE FROM anfragen WHERE id = ?', [id]);
  return true;
}

async function ping() {
  if (!pool) return 'datei';
  try { await pool.query('SELECT 1'); return 'ok'; } catch (e) { return 'fehler'; }
}

module.exports = { init, saveAnfrage, list, setStatus, remove, ping };
