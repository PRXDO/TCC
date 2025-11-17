<script setup>
import { ref } from 'vue';
import api from '../../services/api';

const nome = ref('');
const email = ref('');
const senha = ref('');
const mensagem = ref('');

const cadastrarTecnico = async () => {
  mensagem.value = '';
  try {
    await api.post('/usuarios', {
      nome: nome.value,
      email: email.value,
      senha: senha.value,
      perfil: 'tecnico' // Perfil fixo
    });
    mensagem.value = 'Técnico cadastrado com sucesso!';
    nome.value = '';
    email.value = '';
    senha.value = '';
  } catch (err) {
    if (err.response && err.response.data.message.includes('email')) {
      mensagem.value = 'Este email já está cadastrado.';
    } else {
      mensagem.value = 'Erro ao cadastrar técnico.';
    }
  }
};
</script>

<template>
  <form @submit.prevent="cadastrarTecnico" class="form-admin">
    <h2>Cadastrar Novo Técnico</h2>
    <div class="form-group">
      <label for="tec-nome">Nome</label>
      <input id="tec-nome" v-model="nome" required />
    </div>
    <div class="form-group">
      <label for="tec-email">Email (para login)</label>
      <input id="tec-email" type="email" v-model="email" required />
    </div>
    <div class="form-group">
      <label for="tec-senha">Senha Provisória</label>
      <input id="tec-senha" type="password" v-model="senha" required />
    </div>
    <button type="submit">Cadastrar Técnico</button>
    <p v-if="mensagem" class="msg-feedback">{{ mensagem }}</p>
  </form>
</template>

<style scoped>
/* (Estilos genéricos) */
.form-admin { padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.5rem; box-sizing: border-box; }
.msg-feedback { margin-top: 1rem; }
</style>