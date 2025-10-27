// routes/responsaveis.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const verificarToken = require('../middleware/auth');

// Rota para ADICIONAR um novo Responsável (Somente Admin)
// CAMINHO: POST /responsaveis
router.post('/', verificarToken, async (req, res) => {
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
// CAMINHO: GET /responsaveis
router.get('/', verificarToken, async (req, res) => {
  try {
    const todosResponsaveis = await pool.query('SELECT * FROM Responsavel ORDER BY nome');
    res.status(200).json(todosResponsaveis.rows);
  } catch (error) {
    console.error('Erro ao listar responsáveis:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;