# API de Pets (Node.js + Express + MySQL/MariaDB)

CRUD de pets com busca por nome e exclusão **lógica** ou **definitiva**, organizado em camadas.

## Estrutura

```
src/
├── server.js                 inicia o banco e sobe o servidor
├── app.js                    configura o Express (rotas e erros)
├── config/database.js        conexão (pool) e criação do banco/tabela
├── routes/pet.routes.js      rotas HTTP
├── controllers/              camada HTTP (req/res)
├── services/                 regras de negócio e validações
├── repositories/             acesso ao banco (SQL)
├── middlewares/errorHandler  tratamento central de exceções
└── errors/AppError.js        erro de negócio com código HTTP
sql/schema.sql                script SQL (opcional, a API já cria o banco)
```

## Como executar

1. Ligue o MySQL/MariaDB (no XAMPP: botão **Start** na linha do MySQL).
2. Na pasta do projeto:
   ```
   npm install
   npm start
   ```
3. A API sobe em `http://localhost:3000`. O banco `petshop` e a tabela `pet` são criados automaticamente.

Configuração por variáveis de ambiente (valores padrão entre parênteses): `DB_HOST` (localhost), `DB_PORT` (3306), `DB_USER` (root), `DB_PASSWORD` (vazia), `DB_NAME` (petshop), `PORT` (3000).

## Modelo

| Campo | Tipo | Regra |
|---|---|---|
| codigo_pet | inteiro | gerado automaticamente |
| nome_pet | texto | obrigatório, até 100 caracteres |
| genero_pet | texto | `M` ou `F` |

A tabela também tem a coluna interna `excluido` (0 ou 1), usada na exclusão lógica. Ela não aparece nas respostas.

## Endpoints

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| POST | `/pets` | cria um pet | 201 |
| GET | `/pets` | lista os pets ativos | 200 |
| GET | `/pets/busca?nome=rex` | busca por parte do nome (sem diferenciar maiúsculas) | 200 |
| GET | `/pets/:codigo` | busca um pet pelo código | 200 |
| PUT | `/pets/:codigo` | atualiza nome e gênero | 200 |
| DELETE | `/pets/:codigo?tipo=logica` | exclusão lógica (padrão) | 200 |
| DELETE | `/pets/:codigo?tipo=definitiva` | exclusão definitiva | 200 |

### Regra de negócio da exclusão

- `tipo=logica` (ou sem o parâmetro): o registro **continua no banco** com `excluido = 1` e deixa de aparecer em listagem, busca, consulta por código e atualização. Excluir de novo um pet já excluído logicamente retorna **409**.
- `tipo=definitiva`: o registro é **removido do banco** (`DELETE`). Também funciona para pets já excluídos logicamente.
- Qualquer outro valor de `tipo` retorna **400**.

### Códigos de erro

| Código | Situação |
|---|---|
| 400 | dados inválidos, código inválido, JSON malformado, tipo de exclusão inválido, busca sem `nome` |
| 404 | pet ou rota não encontrada |
| 409 | pet já excluído logicamente |
| 503 | banco de dados indisponível |
| 500 | erro inesperado (a mensagem real vai só para o log) |

## Exemplos (PowerShell, usando `curl.exe`)

```powershell
curl.exe -X POST -H "Content-Type: application/json" -d "{\"nome_pet\":\"Rex\",\"genero_pet\":\"M\"}" http://localhost:3000/pets
curl.exe http://localhost:3000/pets
curl.exe "http://localhost:3000/pets/busca?nome=rex"
curl.exe -X PUT -H "Content-Type: application/json" -d "{\"nome_pet\":\"Rex II\",\"genero_pet\":\"M\"}" http://localhost:3000/pets/1
curl.exe -X DELETE "http://localhost:3000/pets/1?tipo=logica"
curl.exe -X DELETE "http://localhost:3000/pets/1?tipo=definitiva"
```

Também funciona no Postman: `POST /pets` com Body → raw → JSON `{"nome_pet": "Rex", "genero_pet": "M"}`.

## Assincronismo e tratamento de exceção

- Todo acesso ao banco usa `async/await` com `mysql2/promise`.
- `asyncHandler` encaminha qualquer erro de função assíncrona para o `errorHandler` central.
- Erros de validação e de negócio usam `AppError` (com status HTTP). Erros de banco e erros inesperados viram 503 ou 500 sem expor detalhes internos.
