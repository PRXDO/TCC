// routes/salas.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const verificarToken = require('../middleware/auth');

// Rota para ADICIONAR uma nova Sala (Somente Admin)
// CAMINHO: POST /salas
router.post('/', verificarToken, async (req, res) => {
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
      [descricao, responsavel_id || null]
    );
    res.status(201).json(novaSala.rows[0]);
  } catch (error) {
    if (error.code === '23503') { 
      return res.status(400).json({ message: 'O responsavel_id informado não existe.' });
    }
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todas as Salas (Qualquer usuário logado)
// CAMINHO: GET /salas
router.get('/', verificarToken, async (req, res) => {
  try {
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

module.exports = router;