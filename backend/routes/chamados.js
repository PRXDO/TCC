// routes/chamados.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const verificarToken = require('../middleware/auth');

// Rota para ABRIR um novo chamado (Qualquer usuário logado)
// CAMINHO: POST /chamados
router.post('/', verificarToken, async (req, res) => {
  // Vamos pegar um "cliente" dedicado da nossa pool de conexões
  const client = await pool.connect(); 
  
  try {
    // 1. Pegar os dados da requisição
    const { motivo, equipamentos_ids } = req.body; // ex: [1, 2, 3]
    
    // 2. Pegar o ID do solicitante (do token que o middleware validou)
    const solicitante_id = req.usuario.id;

    // 3. Validação
    if (!motivo || !equipamentos_ids || !Array.isArray(equipamentos_ids) || equipamentos_ids.length === 0) {
      return res.status(400).json({ message: 'O "motivo" e um array "equipamentos_ids" (com pelo menos um ID) são obrigatórios.' });
    }

    // --- INÍCIO DA TRANSAÇÃO ---
    await client.query('BEGIN');

    // 4. Inserir na tabela principal "Manutencao"
    const queryManutencao = `
      INSERT INTO Manutencao (solicitante_id, motivo) 
      VALUES ($1, $2) 
      RETURNING id
    `;
    const resultadoManutencao = await client.query(queryManutencao, [solicitante_id, motivo]);
    
    // 5. Pegar o ID do chamado que acabamos de criar
    const novoChamadoId = resultadoManutencao.rows[0].id;

    // 6. Inserir na tabela de ligação "Equipamento_Manutencao" (N vezes)
    const queryLigacao = `
      INSERT INTO Equipamento_Manutencao (manutencao_id, equipamento_id) 
      VALUES ($1, $2)
    `;
    
    // Loop para inserir cada equipamento
    for (const eq_id of equipamentos_ids) {
      await client.query(queryLigacao, [novoChamadoId, eq_id]);
    }

    // 7. Se tudo deu certo, "comitar" (salvar) a transação
    await client.query('COMMIT');
    
    res.status(201).json({ message: 'Chamado aberto com sucesso!', chamado_id: novoChamadoId });

  } catch (error) {
    // 8. Se qualquer passo acima deu erro, "dar rollback" (desfazer)
    await client.query('ROLLBACK');
    
    console.error('Erro ao abrir chamado:', error);
    // Erro comum: equipamento_id não existe
    if (error.code === '23503') { 
      return res.status(400).json({ message: 'Um dos IDs de equipamento informados não existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao abrir chamado' });
  
  } finally {
    // 9. Independente de sucesso ou falha, liberar o cliente de volta para a pool
    client.release();
  }
});

// Rota para LISTAR os chamados
// CAMINHO: GET /chamados
router.get('/', verificarToken, async (req, res) => {
  try {
    // 1. Pegar o perfil do usuário logado (do token)
    const { id: usuarioId, perfil } = req.usuario;

    // 2. Montar a query base com JOINs
    let query = `
      SELECT 
        m.id, 
        m.status, 
        m.motivo, 
        m.data_abertura, 
        m.data_conclusao,
        u_solic.nome AS solicitante_nome,
        u_tec.nome AS tecnico_nome
      FROM Manutencao m
      JOIN Usuario u_solic ON m.solicitante_id = u_solic.id
      LEFT JOIN Usuario u_tec ON m.tecnico_id = u_tec.id
    `;
    const params = [];

    // 3. Se for um usuário comum, filtre para ver apenas os chamados dele
    if (perfil === 'usuario') {
      query += ' WHERE m.solicitante_id = $1';
      params.push(usuarioId);
    }
    // Se for Admin ou Tecnico, ele não entra no IF e vê tudo.

    // 4. Ordenar pelos mais recentes
    query += ' ORDER BY m.data_abertura DESC';

    // 5. Executar a query
    const todosChamados = await pool.query(query, params);
    
    res.status(200).json(todosChamados.rows);

  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para BUSCAR UM CHAMADO ESPECÍFICO
// CAMINHO: GET /chamados/:id
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const { id: chamadoId } = req.params;
    const { id: usuarioId, perfil } = req.usuario;

    // --- 1. Buscar os dados principais do chamado ---
    const queryChamado = `
      SELECT 
        m.id, m.status, m.motivo, m.descricao_execucao,
        m.data_abertura, m.data_conclusao,
        u_solic.id AS solicitante_id, u_solic.nome AS solicitante_nome,
        u_tec.id AS tecnico_id, u_tec.nome AS tecnico_nome
      FROM Manutencao m
      JOIN Usuario u_solic ON m.solicitante_id = u_solic.id 
      LEFT JOIN Usuario u_tec ON m.tecnico_id = u_tec.id
      WHERE m.id = $1
    `;
    const resultadoChamado = await pool.query(queryChamado, [chamadoId]);

    if (resultadoChamado.rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }

    const chamado = resultadoChamado.rows[0];

    // --- 2. Checagem de Segurança ---
    // Se for um usuário comum, ele só pode ver o chamado se for dele
    if (perfil === 'usuario' && chamado.solicitante_id !== usuarioId) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // --- 3. Buscar os equipamentos ligados a esse chamado ---
    const queryEquipamentos = `
      SELECT 
        eq.id, eq.descricao, 
        it.descricao AS item_descricao,
        sa.descricao AS sala_descricao
      FROM Equipamento_Manutencao em
      JOIN Equipamento eq ON em.equipamento_id = eq.id
      JOIN Item it ON eq.item_id = it.id
      JOIN Sala sa ON eq.sala_id = sa.id
      WHERE em.manutencao_id = $1
    `;
    const resultadoEquipamentos = await pool.query(queryEquipamentos, [chamadoId]);

    // --- 4. Combinar tudo e retornar ---
    const respostaFinal = {
      ...chamado, // Pega todos os campos do chamado
      equipamentos: resultadoEquipamentos.rows // Adiciona um array com os equipamentos
    };

    res.status(200).json(respostaFinal);

  } catch (error) {
    console.error('Erro ao buscar chamado específico:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para ATUALIZAR um chamado (Status, Descrição, etc.)
// CAMINHO: PATCH /chamados/:id
router.patch('/:id', verificarToken, async (req, res) => {
  try {
    // 1. Verificar permissão (SÓ Admin ou Tecnico)
    if (req.usuario.perfil === 'usuario') {
      return res.status(403).json({ message: 'Acesso negado. Apenas Técnicos ou Administradores.' }); // 403 = Proibido
    }

    // 2. Pegar os dados da requisição
    const { id: chamadoId } = req.params;           // O ID do chamado vem da URL (ex: /chamados/1)
    const { status, descricao_execucao } = req.body; // O que queremos mudar
    const tecnicoId = req.usuario.id;               // A pessoa que está fazendo a mudança

    // 3. Validação (Pelo menos o status deve ser enviado)
    if (!status) {
      return res.status(400).json({ message: 'Pelo menos o campo "status" é obrigatório para atualizar.' });
    }

    // 4. Lógica de Negócio e Query Dinâmica
    // Vamos construir a query aos poucos para ser flexível

    let camposParaAtualizar = [];
    const valores = [];
    let contadorParams = 1;

    // Adiciona os campos que vieram no body
    camposParaAtualizar.push(`status = $${contadorParams++}`);
    valores.push(status);

    if (descricao_execucao) {
      camposParaAtualizar.push(`descricao_execucao = $${contadorParams++}`);
      valores.push(descricao_execucao);
    }

    // Lógica de Atribuição: Se o chamado ainda não tem técnico,
    // atribui automaticamente a quem fez esta primeira atualização.
    camposParaAtualizar.push(`tecnico_id = COALESCE(tecnico_id, $${contadorParams++})`);
    valores.push(tecnicoId);

    // Lógica de Conclusão: Se o status for 'Concluído' ou 'Cancelado',
    // preenche a data de conclusão automaticamente.
    if (status === 'Concluído' || status === 'Cancelado') {
      camposParaAtualizar.push(`data_conclusao = $${contadorParams++}`);
      valores.push(new Date()); // Data/Hora atual
    }

    // Adiciona o ID do chamado no final (para o WHERE)
    valores.push(chamadoId);

    // 5. Montar a Query Final
    const queryUpdate = `
      UPDATE Manutencao
      SET ${camposParaAtualizar.join(', ')}
      WHERE id = $${contadorParams}
      RETURNING *
    `;
    
    // 6. Executar
    const resultado = await pool.query(queryUpdate, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' }); // 404 = Not Found
    }

    // 7. Retornar o chamado atualizado
    res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;