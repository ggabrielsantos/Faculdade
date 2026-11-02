const AppError = require('../errors/AppError');

// Encaminha erros de funções async para o errorHandler do Express
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// Tratamento centralizado de exceções
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message });
  }

  // corpo da requisição com JSON malformado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  // banco fora do ar ou conexão perdida
  if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT'].includes(err.code)) {
    console.error('Banco indisponível:', err.code);
    return res.status(503).json({ erro: 'Banco de dados indisponível' });
  }

  console.error('Erro inesperado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = { asyncHandler, rotaNaoEncontrada, errorHandler };
