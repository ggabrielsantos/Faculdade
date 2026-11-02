const { getPool } = require('../config/database');

// Camada de acesso a dados: só conversa com o banco, sem regras de negócio.

async function inserir({ nome_pet, genero_pet }) {
  const [resultado] = await getPool().execute(
    'INSERT INTO pet (nome_pet, genero_pet) VALUES (?, ?)',
    [nome_pet, genero_pet]
  );
  return resultado.insertId;
}

async function listar() {
  const [linhas] = await getPool().execute(
    'SELECT codigo_pet, nome_pet, genero_pet FROM pet WHERE excluido = 0 ORDER BY codigo_pet'
  );
  return linhas;
}

async function buscarPorNome(nome) {
  const [linhas] = await getPool().execute(
    'SELECT codigo_pet, nome_pet, genero_pet FROM pet WHERE excluido = 0 AND nome_pet LIKE ?',
    [`%${nome}%`]
  );
  return linhas;
}

async function buscarPorCodigo(codigo, { incluirExcluidos = false } = {}) {
  const [linhas] = await getPool().execute(
    `SELECT codigo_pet, nome_pet, genero_pet, excluido FROM pet
     WHERE codigo_pet = ? ${incluirExcluidos ? '' : 'AND excluido = 0'}`,
    [codigo]
  );
  return linhas[0] || null;
}

async function atualizar(codigo, { nome_pet, genero_pet }) {
  const [resultado] = await getPool().execute(
    'UPDATE pet SET nome_pet = ?, genero_pet = ? WHERE codigo_pet = ? AND excluido = 0',
    [nome_pet, genero_pet, codigo]
  );
  return resultado.affectedRows;
}

async function excluirLogicamente(codigo) {
  const [resultado] = await getPool().execute(
    'UPDATE pet SET excluido = 1 WHERE codigo_pet = ?',
    [codigo]
  );
  return resultado.affectedRows;
}

async function excluirDefinitivamente(codigo) {
  const [resultado] = await getPool().execute(
    'DELETE FROM pet WHERE codigo_pet = ?',
    [codigo]
  );
  return resultado.affectedRows;
}

module.exports = {
  inserir,
  listar,
  buscarPorNome,
  buscarPorCodigo,
  atualizar,
  excluirLogicamente,
  excluirDefinitivamente
};
