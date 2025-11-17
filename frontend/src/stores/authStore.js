// src/stores/authStore.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // ref é para criar estados reativos

// Usamos a 'localStorage' do navegador para que o usuário
// continue logado mesmo se fechar a aba (F5)
const tokenSalvo = localStorage.getItem('token');
const usuarioSalvo = JSON.parse(localStorage.getItem('usuario')); // O usuário é um JSON

// defineStore('nome-da-store', () => { ... })
export const useAuthStore = defineStore('auth', () => {
  
  // --- STATE (os dados) ---
  const token = ref(tokenSalvo || null); // O token JWT
  const usuario = ref(usuarioSalvo || null); // Os dados do usuário (id, nome, email, perfil)

  // --- GETTERS (dados computados) ---
  // Um "getter" que nos diz se o usuário está logado
  const estaLogado = computed(() => !!token.value);
  // Um "getter" que nos diz se o usuário é admin
  const ehAdmin = computed(() => usuario.value?.perfil === 'admin');

  // --- ACTIONS (as funções) ---

  // Ação para salvar o login
  function setUsuarioLogado(novoToken, novoUsuario) {
    token.value = novoToken;
    usuario.value = novoUsuario;
    localStorage.setItem('token', novoToken);
    localStorage.setItem('usuario', JSON.stringify(novoUsuario));
  }

  // Ação de Logout
  function logout() {
    token.value = null;
    usuario.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // (Mais tarde, vamos redirecionar para a página de login aqui)
  }

  // O que a store "expõe" para o resto da aplicação
  return {
    // State
    token,
    usuario,
    // Getters
    estaLogado,
    ehAdmin,
    // Actions
    setUsuarioLogado,
    logout
  };
});