<script setup>
import { ref } from 'vue';
import api from '../../services/api';

const descricao = ref('');
const mensagem = ref('');

const cadastrarSala = async () => {
  mensagem.value = '';
  try {
    await api.post('/salas', { descricao: descricao.value });
    mensagem.value = 'Sala cadastrada com sucesso!';
    descricao.value = '';
  } catch (err) {
    mensagem.value = 'Erro ao cadastrar sala.';
  }
};
</script>

<template>
  <form @submit.prevent="cadastrarSala" class="form-admin">
    <h2>Cadastrar Nova Sala</h2>
    <div class="form-group">
      <label for="sala-desc">Descrição (Ex: Sala 101, Auditório)</label>
      <input id="sala-desc" v-model="descricao" required />
    </div>
    <button type="submit">Cadastrar Sala</button>
    <p v-if="mensagem" class="msg-feedback">{{ mensagem }}</p>
  </form>
</template>

<style scoped>
.form-admin { padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.5rem; box-sizing: border-box; }
.msg-feedback { margin-top: 1rem; }
</style>