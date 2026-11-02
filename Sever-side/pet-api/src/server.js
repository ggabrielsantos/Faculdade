const app = require('./app');
const { iniciarBanco } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await iniciarBanco();
    app.listen(PORT, () => {
      console.log(`API de pets rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Não foi possível iniciar a API:', erro.message);
    console.error('Verifique se o MySQL/MariaDB está ligado e se as credenciais estão corretas.');
    process.exit(1);
  }
}

iniciar();
