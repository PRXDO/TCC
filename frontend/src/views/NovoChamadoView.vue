<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

// --- Estado ---
const motivo = ref(''); // Para o <textarea>
const equipamentosDisponiveis = ref([]); // Lista de equipamentos vinda do backend
const equipamentosSelecionados = ref([]); // Array de IDs dos equipamentos marcados
const carregando = ref(true);
const erro = ref(null);
const router = useRouter();

// --- Funções ---

// 1. Buscar todos os equipamentos cadastrados
const buscarEquipamentos = async () => {
  try {
    const response = await api.get('/equipamentos');
    // Usamos o JOIN que fizemos no backend para mostrar dados úteis
    equipamentosDisponiveis.value = response.data;
  } catch (err) {
    console.error('Erro ao buscar equipamentos:', err);
    erro.value = 'Falha ao carregar lista de equipamentos.';
  } finally {
    carregando.value = false;
  }
};

// 2. Enviar o novo chamado para a API
const abrirChamado = async () => {
  erro.value = null;
  // Validação simples
  if (!motivo.value || equipamentosSelecionados.value.length === 0) {
    erro.value = 'Você precisa preencher o motivo E selecionar pelo menos um equipamento.';
    return;
  }

  try {
    carregando.value = true;
    // O backend espera { motivo: "...", equipamentos_ids: [1, 2] }
    await api.post('/chamados', {
      motivo: motivo.value,
      equipamentos_ids: equipamentosSelecionados.value
    });
    
    // 3. Sucesso! Redireciona de volta para a lista
    router.push('/dashboard'); 

  } catch (err) {
    console.error('Erro ao abrir chamado:', err);
    erro.value = 'Erro ao enviar chamado. Tente novamente.';
  } finally {
    carregando.value = false;
  }
};

// --- Gatilho ---
// Buscar os equipamentos assim que a página carregar
onMounted(() => {
  buscarEquipamentos();
});
</script>

<template>
  <div class="novo-chamado-container">
    <h1>Abrir Novo Chamado</h1>
    
    <form @submit.prevent="abrirChamado" class="form-chamado">
      
      <div class="form-group">
        <label for="motivo">Motivo do Chamado</label>
        <textarea 
          id="motivo"
          v-model="motivo"
          rows="5"
          placeholder="Descreva o problema que você encontrou..."
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label>Selecione os Equipamentos com Defeito</label>
        
        <div v-if="carregando">Carregando equipamentos...</div>
        
        <div v-if="!carregando" class="lista-equipamentos">
          <div 
            v-for="eq in equipamentosDisponiveis" 
            :key="eq.id" 
            class="checkbox-item"
          >
            <input 
              type="checkbox" 
              :id="`eq-${eq.id}`"
              :value="eq.id"
              v-model="equipamentosSelecionados"
            />
            <label :for="`eq-${eq.id}`">
              <strong>{{ eq.descricao }}</strong> 
              ({{ eq.item_descricao }} - {{ eq.sala_descricao }})
            </label>
          </div>
        </div>
      </div>

      <div v-if="erro" class="erro">{{ erro }}</div>
      
      <div class="form-actions">
        <button 
          type="button" 
          class="btn-cancelar" 
          @click="router.push('/dashboard')"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn-enviar" 
          :disabled="carregando"
        >
          {{ carregando ? 'Enviando...' : 'Abrir Chamado' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.novo-chamado-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 1rem;
}

.lista-equipamentos {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 4px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.checkbox-item input {
  margin-right: 0.75rem;
  width: 1.2rem;
  height: 1.2rem;
}
.checkbox-item label {
  font-weight: normal;
  color: #333;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-enviar, .btn-cancelar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-enviar {
  background-color: #FCD116; /* Sua cor primária */
  color: #222;
}
.btn-enviar:hover {
  background-color: #eab200;
}
.btn-enviar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancelar {
  background-color: transparent;
  color: #555;
  border: 1px solid #ccc;
}
.btn-cancelar:hover {
  background-color: #f4f4f4;
}

.erro {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}
</style>