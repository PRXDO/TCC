<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

// Estado do formulário
const descricao = ref('');
const itemSelecionado = ref(null);
const salaSelecionada = ref(null);
const mensagem = ref('');

// Listas para os dropdowns
const listaItens = ref([]);
const listaSalas = ref([]);
const carregando = ref(true);

// Busca dados para os <select>
const carregarListas = async () => {
  try {
    const [resItens, resSalas] = await Promise.all([
      api.get('/itens'),
      api.get('/salas')
    ]);
    listaItens.value = resItens.data;
    listaSalas.value = resSalas.data;
  } catch (err) {
    mensagem.value = 'Erro ao carregar listas de Itens e Salas.';
  } finally {
    carregando.value = false;
  }
};

onMounted(carregarListas);

const cadastrarEquipamento = async () => {
  mensagem.value = '';
  if (!itemSelecionado.value || !salaSelecionada.value) {
    mensagem.value = 'Selecione um Item e uma Sala.';
    return;
  }
  try {
    await api.post('/equipamentos', {
      descricao: descricao.value,
      item_id: itemSelecionado.value,
      sala_id: salaSelecionada.value
    });
    mensagem.value = 'Equipamento cadastrado com sucesso!';
    descricao.value = '';
    itemSelecionado.value = null;
    salaSelecionada.value = null;
  } catch (err) {
    mensagem.value = 'Erro ao cadastrar equipamento.';
  }
};
</script>

<template>
  <form @submit.prevent="cadastrarEquipamento" class="form-admin">
    <h2>Cadastrar Novo Equipamento</h2>
    
    <div v-if="carregando">Carregando listas...</div>
    
    <div v-if="!carregando">
      <div class="form-group">
        <label for="eq-desc">Descrição (Ex: PAT-12345, Computador da Mesa 2)</label>
        <input id="eq-desc" v-model="descricao" required />
      </div>
      
      <div class="form-group">
        <label for="eq-item">Tipo de Item</label>
        <select id="eq-item" v-model="itemSelecionado" required>
          <option :value="null" disabled>Selecione um tipo de item</option>
          <option v-for="item in listaItens" :key="item.id" :value="item.id">
            {{ item.descricao }} ({{ item.marca || 's/ marca' }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="eq-sala">Sala (Localização)</label>
        <select id="eq-sala" v-model="salaSelecionada" required>
          <option :value="null" disabled>Selecione uma sala</option>
          <option v-for="sala in listaSalas" :key="sala.id" :value="sala.id">
            {{ sala.descricao }}
          </option>
        </select>
      </div>
      
      <button type="submit">Cadastrar Equipamento</button>
      <p v-if="mensagem" class="msg-feedback">{{ mensagem }}</p>
    </div>
  </form>
</template>

<style scoped>
/* (Estilos genéricos) */
.form-admin { padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.5rem; box-sizing: border-box; }
.msg-feedback { margin-top: 1rem; }
</style>