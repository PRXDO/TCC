// 1. Importar as bibliotecas que acabamos de instalar
const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth'); // Importa o middleware de autenticação
const { pool } = require('../config/database');

// ---- INÍCIO DO CRUD DE ITENS ----

// Rota para ADICIONAR um novo Item (Somente Admin)
router.post('/', verificarToken, async (req, res) => {
  try {
    // 1. Verificamos se o usuário logado (que veio do token) é admin
    if (req.usuario.perfil !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Somente administradores.' }); // 403 = Proibido (Forbidden)
    }

    // 2. Pegar os dados do corpo da requisição
    const { descricao, marca, modelo } = req.body;
    if (!descricao) {
      return res.status(400).json({ message: 'O campo "descricao" é obrigatório.' });
    }

    // 3. Inserir o novo item no banco
    const novoItem = await pool.query(
      'INSERT INTO Item (descricao, marca, modelo) VALUES ($1, $2, $3) RETURNING *',
      [descricao, marca || null, modelo || null] // Usa null se marca/modelo não forem enviados
    );

    // 4. Retornar o item que foi criado
    res.status(201).json(novoItem.rows[0]);

  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todos os Itens (Qualquer usuário logado)
router.get('/', verificarToken, async (req, res) => {
  try {
    // Note que aqui não checamos o perfil.
    // Qualquer um com um token válido pode listar os itens.
    const todosItens = await pool.query('SELECT * FROM Item ORDER BY descricao');
    
    res.status(200).json(todosItens.rows);

  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ---- FIM DO CRUD DE ITENS ----

// Exporta o router para ser usado no index.js
module.exports = router;