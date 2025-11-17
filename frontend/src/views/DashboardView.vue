<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api'; // 1. Usamos nosso serviço de API
import { useRouter } from 'vue-router'; // (Vamos usar no próximo passo para o botão "Novo")


// --- Estado ---
const chamados = ref([]); // Um array reativo para guardar a lista de chamados
const carregando = ref(true); // Para mostrar um feedback de "carregando..."
const erro = ref(null); // Para mostrar mensagens de erro da API

const router = useRouter(); // (Vamos usar no próximo passo)

const irParaDetalhes = (id) => {
  router.push({ name: 'detalhes-chamado', params: { id } });
};

// --- Funções ---
const buscarChamados = async () => {
  carregando.value = true;
  erro.value = null;
  try {
    // 2. É SÓ ISSO! O api.js cuida da URL base e do token.
    // O backend cuida de filtrar (se for usuário comum, vê só os dele).
    const response = await api.get('/chamados');
    chamados.value = response.data;
  } catch (err) {
    console.error('Erro ao buscar chamados:', err);
    erro.value = 'Não foi possível carregar os chamados.';
  } finally {
    carregando.value = false;
  }
};

// --- Gatilho (Lifecycle Hook) ---
// onMounted() é uma função do Vue que roda
// automaticamente assim que o componente é "montado" (exibido)
onMounted(() => {
  buscarChamados();
});

// (Função para o botão "Novo" que criaremos em seguida)
const irParaNovoChamado = () => {
  router.push({ name: 'novo-chamado' }); // Usamos o "name" da rota
};
</script>

<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>Meus Chamados</h1>
      <button class="btn-novo" @click="irParaNovoChamado"> 
        + Novo Chamado
      </button>
    </div>

    <div v-if="carregando" class="feedback">Carregando chamados...</div>
    
    <div v-if="erro" class="feedback erro">{{ erro }}</div>

    <table v-if="!carregando && chamados.length > 0" class="chamados-tabela">
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Motivo</th>
          <th>Solicitante</th>
          <th>Técnico</th>
          <th>Abertura</th>
          </tr>
      </thead>
      <tbody>
        <tr v-for="chamado in chamados" :key="chamado.id" @click="irParaDetalhes(chamado.id)" class="linha-clicavel"> 
          <td>#{{ chamado.id }}</td>
          <td>
            <span :class="['status', `status-${chamado.status.toLowerCase()}`]">
              {{ chamado.status }}
            </span>
          </td>
          <td class="motivo">{{ chamado.motivo }}</td>
          <td>{{ chamado.solicitante_nome }}</td>
          <td>{{ chamado.tecnico_nome || '---' }}</td>
          <td>{{ new Date(chamado.data_abertura).toLocaleDateString('pt-BR') }}</td>
          </tr>
      </tbody>
    </table>

    <div v-if="!carregando && chamados.length === 0" class="feedback">
      Nenhum chamado encontrado.
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  color: #333;
}

.btn-novo {
  padding: 0.75rem 1.5rem;
  background-color: #FCD116; /* Sua cor primária */
  color: #222;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-novo:hover {
  background-color: #eab200;
}

.feedback {
  font-size: 1.1rem;
  color: #555;
  text-align: center;
  padding: 2rem;
}
.feedback.erro {
  color: red;
}

.chamados-tabela {
  width: 100%;
  border-collapse: collapse; /* Tira espaço entre células */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Para o border-radius funcionar no <thead> */
}

.chamados-tabela th,
.chamados-tabela td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.chamados-tabela th {
  background-color: #f9f9f9;
  color: #555;
  font-weight: 600;
}

.chamados-tabela tr:last-child td {
  border-bottom: none;
}

.chamados-tabela tr:hover {
  background-color: #fcfcfc;
}

.motivo {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Adiciona "..." se o motivo for muito longo */
}

/* Estilos para os Status */
.status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.85rem;
}
.status-aberto {
  background-color: #e0f7fa;
  color: #00796b;
}
.status-em { /* 'Em Andamento' */
  background-color: #fff9c4;
  color: #f57f17;
}
.status-concluído {
  background-color: #e8f5e9;
  color: #388e3c;
}
.status-cancelado {
  background-color: #ffebee;
  color: #d32f2f;
}

.linha-clicavel {
  cursor: pointer;
}
</style>