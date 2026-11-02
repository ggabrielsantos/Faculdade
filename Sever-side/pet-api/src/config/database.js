const mysql = require('mysql2/promise');

const conexaoBase = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};
const NOME_BANCO = process.env.DB_NAME || 'petshop';

let pool;

// Cria o banco e a tabela se ainda não existirem, e abre o pool de conexões
async function iniciarBanco() {
  const conexao = await mysql.createConnection(conexaoBase);
  try {
    await conexao.query(
      `CREATE DATABASE IF NOT EXISTS \`${NOME_BANCO}\` CHARACTER SET utf8mb4`
    );
  } finally {
    await conexao.end();
  }

  pool = mysql.createPool({
    ...conexaoBase,
    database: NOME_BANCO,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pet (
      codigo_pet INT AUTO_INCREMENT PRIMARY KEY,
      nome_pet   VARCHAR(100) NOT NULL,
      genero_pet CHAR(1)      NOT NULL,
      excluido   TINYINT(1)   NOT NULL DEFAULT 0
    )
  `);
}

function getPool() {
  if (!pool) {
    throw new Error('Banco de dados não inicializado');
  }
  return pool;
}

module.exports = { iniciarBanco, getPool };
