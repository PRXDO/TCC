const { Pool } = require('pg'); // Importa o 'Pool' da biblioteca 'pg'

// 3. Configurar a Conexão com o Banco de Dados (PostgreSQL)
// O "Pool" gerencia múltiplas conexões com o banco de forma eficiente
const pool = new Pool({
  user: 'postgres',     // <-- MUDE AQUI: Coloque seu usuário do Postgres
  host: 'localhost',                // <-- MUDE AQUI: Se o banco não estiver na sua máquina
  database: 'sgm_tcc',    // <-- MUDE AQUI: O nome do banco que você criou
  password: '1234',   // <-- MUDE AQUI: Sua senha do Postgres
  port: 5432,                       // Porta padrão do Postgres
});

// 2. Exportar o pool para ser usado em outros arquivos
module.exports = {
  pool
};