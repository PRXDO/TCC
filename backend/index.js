// 1. Importar as bibliotecas que acabamos de instalar
const express = require('express');
const verificarToken = require('./middleware/auth'); // Importa o middleware de autenticação
const { pool } = require('./config/database');

const itemRoutes = require('./routes/itens');

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


const bcrypt = require('bcrypt'); // Importa o bcrypt

// Rota para CRIAR um novo usuário (Registro)
app.post('/usuarios', async (req, res) => {
  try {
    // 1. Pegar os dados do corpo da requisição
    // (O frontend vai enviar um JSON com esses dados)
    const { nome, email, senha, perfil } = req.body;

    // 2. Validar a entrada (simples)
    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    // 3. Criptografar a senha
    const saltRounds = 10; // "Força" da criptografia
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 4. Inserir o novo usuário no banco
    //    Usamos "RETURNING *" para que o banco nos devolva o usuário que acabou de ser criado
    const novoUsuario = await pool.query(
      'INSERT INTO Usuario (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil',
      [nome, email, senhaHash, perfil]
    );

    // 5. Enviar uma resposta de sucesso
    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: novoUsuario.rows[0] // Mostra o usuário criado (sem a senha, claro)
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    // Erro comum: email duplicado (lembra do "UNIQUE" que colocamos?)
    if (error.code === '23505') { 
      return res.status(400).json({ message: 'Este email já está cadastrado.' });
    }

    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// ---- INÍCIO DO NOVO CÓDIGO (LOGIN) ----

const jwt = require('jsonwebtoken'); // Importa o jsonwebtoken

// Rota para LOGIN de usuário
app.post('/login', async (req, res) => {
  try {
    // 1. Pegar email e senha do corpo da requisição
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // 2. Buscar o usuário no banco pelo email
    const result = await pool.query('SELECT * FROM Usuario WHERE email = $1', [email]);
    const usuario = result.rows[0];

    // 3. Verificar se o usuário existe
    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha inválidos' }); // 401 = Não autorizado
    }

    // 4. Comparar a senha enviada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    // 5. Verificar se a senha bate
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // 6. Se deu tudo certo, gerar o Token JWT
    // "SECRET_KEY_MUITO_SECRETA" -> Isso DEVE ser uma string longa e aleatória
    // Em um projeto real, isso ficaria numa variável de ambiente (.env)
    const token = jwt.sign(
      { 
        id: usuario.id, 
        perfil: usuario.perfil 
      }, // O que queremos guardar no token
      'SECRET_KEY_MUITO_SECRETA', // A chave secreta para assinar o token
      { expiresIn: '8h' } // Tempo de expiração do token (ex: 8 horas)
    );

    // 7. Enviar o token e os dados do usuário (sem a senha)
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ---- FIM DO NOVO CÓDIGO (LOGIN) ----

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
app.use('/itens', itemRoutes);

// ---- INÍCIO DO CRUD DE RESPONSAVEL ----

// Rota para ADICIONAR um novo Responsável (Somente Admin)
app.post('/responsaveis', verificarToken, async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Somente administradores.' });
  }
  
  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
  }

  try {
    const novoResponsavel = await pool.query(
      'INSERT INTO Responsavel (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    res.status(201).json(novoResponsavel.rows[0]);
  } catch (error) {
    console.error('Erro ao criar responsável:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todos os Responsáveis (Qualquer usuário logado)
app.get('/responsaveis', verificarToken, async (req, res) => {
  try {
    const todosResponsaveis = await pool.query('SELECT * FROM Responsavel ORDER BY nome');
    res.status(200).json(todosResponsaveis.rows);
  } catch (error) {
    console.error('Erro ao listar responsáveis:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ---- FIM DO CRUD DE RESPONSAVEL ----
// ---- INÍCIO DO CRUD DE SALA ----

// Rota para ADICIONAR uma nova Sala (Somente Admin)
app.post('/salas', verificarToken, async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Somente administradores.' });
  }
  
  const { descricao, responsavel_id } = req.body;
  if (!descricao) {
    return res.status(400).json({ message: 'O campo "descricao" é obrigatório.' });
  }

  try {
    const novaSala = await pool.query(
      'INSERT INTO Sala (descricao, responsavel_id) VALUES ($1, $2) RETURNING *',
      [descricao, responsavel_id || null] // Permite criar sala sem responsável
    );
    res.status(201).json(novaSala.rows[0]);
  } catch (error) {
    // Erro comum: responsavel_id não existe
    if (error.code === '23503') { 
      return res.status(400).json({ message: 'O responsavel_id informado não existe.' });
    }
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todas as Salas (Qualquer usuário logado)
app.get('/salas', verificarToken, async (req, res) => {
  try {
    // Vamos usar um JOIN para trazer o nome do responsável junto, o que ajuda o frontend
    const query = `
      SELECT s.id, s.descricao, s.responsavel_id, r.nome AS responsavel_nome
      FROM Sala s
      LEFT JOIN Responsavel r ON s.responsavel_id = r.id
      ORDER BY s.descricao
    `;
    const todasSalas = await pool.query(query);
    res.status(200).json(todasSalas.rows);
  } catch (error) {
    console.error('Erro ao listar salas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ---- FIM DO CRUD DE SALA ----

// ---- INÍCIO DO CRUD DE EQUIPAMENTO ----

// Rota para ADICIONAR um novo Equipamento (Somente Admin)
app.post('/equipamentos', verificarToken, async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Somente administradores.' });
  }

  // Um equipamento precisa de uma descrição, um item_id e uma sala_id
  const { descricao, item_id, sala_id } = req.body;
  if (!descricao || !item_id || !sala_id) {
    return res.status(400).json({ message: 'Os campos "descricao", "item_id" e "sala_id" são obrigatórios.' });
  }

  try {
    const novoEquipamento = await pool.query(
      'INSERT INTO Equipamento (descricao, item_id, sala_id) VALUES ($1, $2, $3) RETURNING *',
      [descricao, item_id, sala_id]
    );
    res.status(201).json(novoEquipamento.rows[0]);
  } catch (error) {
    // Erro comum: item_id ou sala_id não existem
    if (error.code === '23503') { 
      return res.status(400).json({ message: 'O item_id ou sala_id informado não existe.' });
    }
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todos os Equipamentos (Qualquer usuário logado)
app.get('/equipamentos', verificarToken, async (req, res) => {
  try {
    // Vamos usar JOINS para trazer informações úteis para o frontend
    // Queremos saber a descrição do Item, sua marca, e a descrição da Sala
    const query = `
      SELECT 
        eq.id, 
        eq.descricao, 
        eq.item_id, 
        it.descricao AS item_descricao,
        it.marca AS item_marca,
        it.modelo AS item_modelo,
        eq.sala_id,
        sa.descricao AS sala_descricao
      FROM Equipamento eq
      JOIN Item it ON eq.item_id = it.id
      JOIN Sala sa ON eq.sala_id = sa.id
      ORDER BY sa.descricao, it.descricao
    `;
    const todosEquipamentos = await pool.query(query);
    res.status(200).json(todosEquipamentos.rows);
  } catch (error) {
    console.error('Erro ao listar equipamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ---- FIM DO CRUD DE EQUIPAMENTO ----


// 6. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
