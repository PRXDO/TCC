// 1. Importar as bibliotecas que acabamos de instalar
const express = require('express');
const verificarToken = require('./middleware/auth'); // Importa o middleware de autenticação
const { pool } = require('./config/database');

// Importar as rotas
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/itens');
const responsavelRoutes = require('./routes/responsaveis'); // 
const salaRoutes = require('./routes/salas'); // 
const equipamentoRoutes = require('./routes/equipamentos'); // 

// 2. Configurar o Express (nosso servidor)
const app = express(); // Inicia o Express
const port = 3001; // A porta que o backend vai "ouvir". Pode ser qualquer uma (ex: 3001)

app.use(express.json()); // Habilita o Express para entender requisições com corpo em JSON

// 4. Criar uma rota de "teste"
// Quando alguém acessar http://localhost:3001/ no navegador, responderemos:
app.get('/', (req, res) => {
  res.send('API de Manutenção está no ar!');
});

// 5. Criar uma rota de "teste de banco"
// Rota para verificar se a conexão com o banco funcionou
app.get('/testar-banco', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Faz uma query simples no banco
    res.status(200).json({
      message: 'Conexão com o PostgreSQL bem-sucedida!',
      horario_do_banco: result.rows[0].now,
    });
  } catch (error) {
    console.error('Erro ao conectar no banco de dados', error);
    res.status(500).json({
      message: 'Erro ao conectar no banco de dados',
      error: error.message,
    });
  }
});

// ---- INÍCIO DO NOVO CÓDIGO (ROTA PROTEGIDA) ----

// Rota de teste PROTEGIDA
// Note o "verificarToken" que colocamos "no meio" da rota.
// O Express vai primeiro executar verificarToken. Se ele chamar next(),
// aí sim ele executa o (req, res) => { ... }
app.get('/rota-protegida', verificarToken, (req, res) => {
  
  // Como o middleware "verificarToken" rodou antes e chamou next(),
  // agora temos acesso ao "req.usuario" que ele anexou.
  res.status(200).json({
    message: 'Você está vendo um conteúdo protegido!',
    usuarioLogado: req.usuario // Mostra o { id, perfil } que estava no token
  });
});

// ---- FIM DO NOVO CÓDIGO (ROTA PROTEGIDA) ----

// ---- ROTAS ----
app.use('/', authRoutes);

app.use('/itens', itemRoutes);

app.use('/responsaveis', responsavelRoutes); // 

app.use('/salas', salaRoutes); // 

app.use('/equipamentos', equipamentoRoutes); // 

// 6. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
