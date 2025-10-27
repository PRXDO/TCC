// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database'); // Importa o pool

// Rota para CRIAR um novo usuário (Registro)
// CAMINHO: POST /usuarios
router.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);
    const novoUsuario = await pool.query(
      'INSERT INTO Usuario (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil',
      [nome, email, senhaHash, perfil]
    );
    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      usuario: novoUsuario.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505') { 
      return res.status(400).json({ message: 'Este email já está cadastrado.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para LOGIN de usuário
// CAMINHO: POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    const result = await pool.query('SELECT * FROM Usuario WHERE email = $1', [email]);
    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
    
    // A MESMA CHAVE SECRETA
    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      'SECRET_KEY_MUITO_SECRETA', 
      { expiresIn: '8h' }
    );
    
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

module.exports = router;