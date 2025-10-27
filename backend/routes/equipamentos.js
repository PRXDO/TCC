// routes/equipamentos.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const verificarToken = require('../middleware/auth');

// Rota para ADICIONAR um novo Equipamento (Somente Admin)
// CAMINHO: POST /equipamentos
router.post('/', verificarToken, async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Somente administradores.' });
  }
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
    if (error.code === '23503') { 
      return res.status(400).json({ message: 'O item_id ou sala_id informado não existe.' });
    }
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LISTAR todos os Equipamentos (Qualquer usuário logado)
// CAMINHO: GET /equipamentos
router.get('/', verificarToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        eq.id, eq.descricao, eq.item_id, 
        it.descricao AS item_descricao, it.marca AS item_marca, it.modelo AS item_modelo,
        eq.sala_id, sa.descricao AS sala_descricao
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

module.exports = router;