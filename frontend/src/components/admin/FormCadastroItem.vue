<script setup>
import { ref } from 'vue';
import api from '../../services/api';

const descricao = ref('');
const marca = ref('');
const modelo = ref('');
const mensagem = ref('');

const cadastrarItem = async () => {
  mensagem.value = '';
  try {
    await api.post('/itens', {
      descricao: descricao.value,
      marca: marca.value,
      modelo: modelo.value
    });
    mensagem.value = 'Item cadastrado com sucesso!';
    // Limpa o formulário
    descricao.value = '';
    marca.value = '';
    modelo.value = '';
  } catch (err) {
    mensagem.value = 'Erro ao cadastrar item. Tente novamente.';
  }
};
</script>

<template>
  <form @submit.prevent="cadastrarItem" class="form-admin">
    <h2>Cadastrar Novo Item</h2>
    <div class="form-group">
      <label for="item-desc">Descrição (Ex: Projetor, Computador)</label>
      <input id="item-desc" v-model="descricao" required />
    </div>
    <div class="form-group">
      <label for="item-marca">Marca</label>
      <input id="item-marca" v-model="marca" />
    </div>
    <div class="form-group">
      <label for="item-modelo">Modelo</label>
      <input id="item-modelo" v-model="modelo" />
    </div>
    <button type="submit">Cadastrar Item</button>
    <p v-if="mensagem" class="msg-feedback">{{ mensagem }}</p>
  </form>
</template>

<style scoped>
/* (Vamos adicionar um CSS genérico na AdminView depois) */
.form-admin { padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.5rem; box-sizing: border-box; }
.msg-feedback { margin-top: 1rem; }
</style>