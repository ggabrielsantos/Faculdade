const service = require('../services/pet.service');

// Camada HTTP: lê a requisição, chama o service e monta a resposta.

async function criar(req, res) {
  const pet = await service.criar(req.body);
  res.status(201).json(pet);
}

async function listar(req, res) {
  res.status(200).json(await service.listar());
}

async function buscarPorNome(req, res) {
  res.status(200).json(await service.buscarPorNome(req.query.nome));
}

async function buscarPorCodigo(req, res) {
  res.status(200).json(await service.buscarPorCodigo(req.params.codigo));
}

async function atualizar(req, res) {
  const pet = await service.atualizar(req.params.codigo, req.body);
  res.status(200).json(pet);
}

async function excluir(req, res) {
  const resultado = await service.excluir(req.params.codigo, req.query.tipo);
  res.status(200).json(resultado);
}

module.exports = { criar, listar, buscarPorNome, buscarPorCodigo, atualizar, excluir };
