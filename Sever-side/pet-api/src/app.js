const express = require('express');
const petRoutes = require('./routes/pet.routes');
const { rotaNaoEncontrada, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use('/pets', petRoutes);
app.use(rotaNaoEncontrada);
app.use(errorHandler);

module.exports = app;
