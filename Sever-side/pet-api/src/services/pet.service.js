const repository = require('../repositories/pet.repository');
const AppError = require('../errors/AppError');

// Camada de regras de negócio: valida dados e decide o que fazer.

const GENEROS = ['M', 'F'];
const TIPOS_EXCLUSAO = ['logica', 'definitiva'];

// remove o campo interno de controle antes de devolver o pet ao cliente
function paraResposta(pet) {
  const { excluido, ...publico } = pet;
  return publico;
}

function validarCodigo(codigo) {
  const numero = Number(codigo);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError('codigo_pet inválido: informe um número inteiro positivo', 400);
  }
  return numero;
}

function validarDados(dados = {}) {
  const { nome_pet, genero_pet } = dados;
  const erros = [];

  if (typeof nome_pet !== 'string' || nome_pet.trim() === '') {
    erros.push('nome_pet é obrigatório');
  } else if (nome_pet.trim().length > 100) {
    erros.push('nome_pet deve ter no máximo 100 caracteres');
  }

  if (!GENEROS.includes(genero_pet)) {
    erros.push("genero_pet deve ser 'M' ou 'F'");
  }

  if (erros.length > 0) {
    throw new AppError(erros.join('; '), 400);
  }

  return { nome_pet: nome_pet.trim(), genero_pet };
}

async function criar(dados) {
  const pet = validarDados(dados);
  const codigo = await repository.inserir(pet);
  return paraResposta(await repository.buscarPorCodigo(codigo));
}

async function listar() {
  return repository.listar();
}

async function buscarPorCodigo(codigo) {
  const id = validarCodigo(codigo);
  const pet = await repository.buscarPorCodigo(id);
  if (!pet) {
    throw new AppError('Pet não encontrado', 404);
  }
  return paraResposta(pet);
}

async function buscarPorNome(nome) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    throw new AppError("Informe o parâmetro 'nome' na busca", 400);
  }
  return repository.buscarPorNome(nome.trim());
}

async function atualizar(codigo, dados) {
  const id = validarCodigo(codigo);
  const pet = validarDados(dados);

  const linhasAfetadas = await repository.atualizar(id, pet);
  if (linhasAfetadas === 0) {
    throw new AppError('Pet não encontrado', 404);
  }
  return paraResposta(await repository.buscarPorCodigo(id));
}

// Regra de negócio: o cliente escolhe o tipo de exclusão (padrão: lógica)
//  - logica:     marca o registro como excluído, mas mantém no banco
//  - definitiva: remove o registro do banco
async function excluir(codigo, tipo = 'logica') {
  const id = validarCodigo(codigo);
  const tipoNormalizado = String(tipo).toLowerCase();

  if (!TIPOS_EXCLUSAO.includes(tipoNormalizado)) {
    throw new AppError("tipo de exclusão inválido: use 'logica' ou 'definitiva'", 400);
  }

  // inclui os já excluídos logicamente: eles ainda podem ser removidos de vez
  const pet = await repository.buscarPorCodigo(id, { incluirExcluidos: true });
  if (!pet) {
    throw new AppError('Pet não encontrado', 404);
  }

  if (tipoNormalizado === 'logica') {
    if (pet.excluido) {
      throw new AppError('Pet já está excluído logicamente', 409);
    }
    await repository.excluirLogicamente(id);
    return { mensagem: 'Pet excluído logicamente', tipo: 'logica', codigo_pet: id };
  }

  await repository.excluirDefinitivamente(id);
  return { mensagem: 'Pet excluído definitivamente', tipo: 'definitiva', codigo_pet: id };
}

module.exports = { criar, listar, buscarPorCodigo, buscarPorNome, atualizar, excluir };
