<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

// --- Hooks e Store ---
const route = useRoute();   // Para pegar o ID da URL
const router = useRouter(); // Para navegar de volta
const authStore = useAuthStore();

// --- Estado ---
const chamado = ref(null);
const carregando = ref(true);
const erro = ref(null);

// Estado para o formulário de atualização
const novoStatus = ref('');
const novaDescricao = ref('');
const atualizando = ref(false);

// --- Computados ---
// Verifica se o usuário pode atualizar (Admin ou Tecnico)
const podeAtualizar = computed(() => {
  return authStore.ehAdmin || authStore.usuario?.perfil === 'tecnico';
});

// --- Funções ---
const buscarDetalhes = async () => {
  carregando.value = true;
  try {
    // Pega o ID que está na URL (ex: /app/chamados/1 -> route.params.id é "1")
    const { id } = route.params;
    const response = await api.get(`/chamados/${id}`);
    chamado.value = response.data;
    
    // Inicializa o formulário com os valores atuais
    novoStatus.value = response.data.status;
    novaDescricao.value = response.data.descricao_execucao || '';

  } catch (err) {
    console.error('Erro ao buscar detalhes:', err);
    erro.value = 'Não foi possível carregar os detalhes do chamado.';
  } finally {
    carregando.value = false;
  }
};

const salvarAtualizacao = async () => {
  if (!novoStatus.value) return;
  
  atualizando.value = true;
  try {
    const { id } = route.params;
    await api.patch(`/chamados/${id}`, {
      status: novoStatus.value,
      descricao_execucao: novaDescricao.value
    });
    
    // Recarrega os dados para mostrar atualizado
    await buscarDetalhes();
    alert('Chamado atualizado com sucesso!');

  } catch (err) {
    console.error('Erro ao atualizar:', err);
    alert('Erro ao atualizar chamado.');
  } finally {
    atualizando.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  buscarDetalhes();
});
</script>

<template>
  <div class="detalhes-container">
    <button class="btn-voltar" @click="router.push('/dashboard')">
      ← Voltar para Lista
    </button>

    <div v-if="carregando" class="loading">Carregando detalhes...</div>
    <div v-if="erro" class="erro">{{ erro }}</div>

    <div v-if="!carregando && chamado" class="conteudo">
      
      <div class="cabecalho-detalhes">
        <h1>Chamado #{{ chamado.id }}</h1>
        <span :class="['status-badge', `status-${chamado.status.toLowerCase()}`]">
          {{ chamado.status }}
        </span>
      </div>

      <div class="secao info-grid">
        <div class="info-item">
          <strong>Solicitante:</strong>
          <p>{{ chamado.solicitante_nome }}</p>
        </div>
        <div class="info-item">
          <strong>Data de Abertura:</strong>
          <p>{{ new Date(chamado.data_abertura).toLocaleString('pt-BR') }}</p>
        </div>
        <div class="info-item">
          <strong>Técnico Responsável:</strong>
          <p>{{ chamado.tecnico_nome || '---' }}</p>
        </div>
        <div class="info-item" v-if="chamado.data_conclusao">
          <strong>Concluído em:</strong>
          <p>{{ new Date(chamado.data_conclusao).toLocaleString('pt-BR') }}</p>
        </div>
      </div>

      <div class="secao">
        <h2>Motivo do Chamado</h2>
        <p class="texto-destaque">{{ chamado.motivo }}</p>
      </div>

      <div class="secao">
        <h2>Equipamentos Afetados</h2>
        <ul class="lista-equipamentos">
          <li v-for="eq in chamado.equipamentos" :key="eq.id">
            <strong>{{ eq.descricao }}</strong>
            <span class="detalhe-eq">({{ eq.item_descricao }} - {{ eq.sala_descricao }})</span>
          </li>
        </ul>
      </div>

      <div class="secao" v-if="chamado.descricao_execucao || chamado.status === 'Concluído'">
        <h2>Execução Técnica</h2>
        <p>{{ chamado.descricao_execucao || 'Nenhuma descrição informada.' }}</p>
      </div>

      <div v-if="podeAtualizar" class="secao area-tecnica">
        <h2>Atualizar Chamado (Área Técnica)</h2>
        <form @submit.prevent="salvarAtualizacao" class="form-atualizacao">
          
          <div class="form-group">
            <label for="status">Novo Status:</label>
            <select id="status" v-model="novoStatus" required>
              <option value="Aberto">Aberto</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div class="form-group">
            <label for="execucao">Descrição da Execução:</label>
            <textarea 
              id="execucao" 
              v-model="novaDescricao" 
              rows="4"
              placeholder="Descreva o que foi feito para resolver..."
            ></textarea>
          </div>

          <button type="submit" class="btn-salvar" :disabled="atualizando">
            {{ atualizando ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.detalhes-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.btn-voltar {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}
.btn-voltar:hover { color: #333; text-decoration: underline; }

.cabecalho-detalhes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #f4f4f4;
  padding-bottom: 1rem;
}
.cabecalho-detalhes h1 { margin: 0; color: #333; }

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9rem;
}
/* Reusando as cores do Dashboard para consistência */
.status-aberto { background-color: #e0f7fa; color: #00796b; }
.status-em { background-color: #fff9c4; color: #f57f17; } /* 'Em Andamento' */
.status-concluído { background-color: #e8f5e9; color: #388e3c; }
.status-cancelado { background-color: #ffebee; color: #d32f2f; }

.secao { margin-bottom: 2.5rem; }
.secao h2 { color: #555; font-size: 1.2rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.info-item strong { display: block; color: #777; font-size: 0.9rem; margin-bottom: 0.25rem; }
.info-item p { margin: 0; font-size: 1.1rem; color: #333; }

.texto-destaque { font-size: 1.1rem; line-height: 1.5; background: #f9f9f9; padding: 1rem; border-radius: 4px; border-left: 4px solid #FCD116; }

.lista-equipamentos { list-style: none; padding: 0; }
.lista-equipamentos li { padding: 0.75rem; border-bottom: 1px solid #eee; }
.detalhe-eq { color: #777; margin-left: 0.5rem; }

.area-tecnica {
  background-color: #fcfcfc;
  border: 2px dashed #ddd;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; color: #555; }
.form-group select, .form-group textarea {
  width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-family: inherit;
}
.btn-salvar {
  background-color: #333; color: #FCD116; /* Invertendo as cores para destacar */
  border: none; padding: 0.75rem 1.5rem; font-weight: bold; border-radius: 4px; cursor: pointer;
}
.btn-salvar:hover { background-color: #555; }
.btn-salvar:disabled { background-color: #999; cursor: not-allowed; }
</style>