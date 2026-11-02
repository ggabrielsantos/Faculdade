const express = require('express');
const controller = require('../controllers/pet.controller');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

router.post('/', asyncHandler(controller.criar));
router.get('/', asyncHandler(controller.listar));
// a busca precisa vir antes de '/:codigo', senão "busca" seria lido como código
router.get('/busca', asyncHandler(controller.buscarPorNome));
router.get('/:codigo', asyncHandler(controller.buscarPorCodigo));
router.put('/:codigo', asyncHandler(controller.atualizar));
router.delete('/:codigo', asyncHandler(controller.excluir));

module.exports = router;
