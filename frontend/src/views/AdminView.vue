<script setup>
import { ref } from 'vue';
import FormCadastroItem from '../components/admin/FormCadastroItem.vue';
import FormCadastroSala from '../components/admin/FormCadastroSala.vue';
import FormCadastroTecnico from '../components/admin/FormCadastroTecnico.vue';
import FormCadastroEquipamento from '../components/admin/FormCadastroEquipamento.vue';

// Controla qual aba está ativa
const abaAtiva = ref('itens'); // Começa com 'itens'

const mudarAba = (aba) => {
  abaAtiva.value = aba;
};
</script>

<template>
  <div class="admin-container">
    <h1>Painel de Administração</h1>
    <p>Cadastre novos recursos no sistema.</p>
    
    <div class="admin-abas">
      <button 
        :class="{ ativo: abaAtiva === 'itens' }" 
        @click="mudarAba('itens')">
        Itens
      </button>
      <button 
        :class="{ ativo: abaAtiva === 'salas' }" 
        @click="mudarAba('salas')">
        Salas
      </button>
      <button 
        :class="{ ativo: abaAtiva === 'equipamentos' }" 
        @click="mudarAba('equipamentos')">
        Equipamentos
      </button>
      <button 
        :class="{ ativo: abaAtiva === 'tecnicos' }" 
        @click="mudarAba('tecnicos')">
        Técnicos
      </button>
    </div>

    <div class="admin-conteudo">
      <FormCadastroItem v-if="abaAtiva === 'itens'" />
      <FormCadastroSala v-if="abaAtiva === 'salas'" />
      <FormCadastroEquipamento v-if="abaAtiva === 'equipamentos'" />
      <FormCadastroTecnico v-if="abaAtiva === 'tecnicos'" />
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  max-width: 900px;
  margin: 0 auto;
}

.admin-abas {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
}
.admin-abas button {
  padding: 1rem 1.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #777;
  border-bottom: 3px solid transparent;
}
.admin-abas button.ativo {
  color: #333;
  border-bottom-color: #FCD116; /* Sua cor! */
}
.admin-abas button:hover {
  background-color: #f9f9f9;
}

.admin-conteudo {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
</style>