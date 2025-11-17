<script setup>
// Importação limpa (removido o useRouter duplicado)
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const fazerLogout = () => {
  authStore.logout(); // Limpa a store e o localStorage
  router.push({ name: 'login' }); // Redireciona para o login
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <span class="navbar-title">Sistema de Manutenção</span>
    </div>
    
    <div class="navbar-links">
      <RouterLink to="/dashboard">Chamados</RouterLink>
      
      <RouterLink v-if="authStore.ehAdmin" to="/app/admin">
        Admin
      </RouterLink>
    </div>
    <div class="navbar-user">
      <span>Olá, {{ authStore.usuario?.nome }}</span>
      <button @click="fazerLogout" class="btn-logout">Sair</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between; /* Espaça os elementos */
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem; /* Espaço entre o nome e o botão */
}

.btn-logout {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #FCD116; 
  color: #222;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background-color: #eab200;
}

/* --- INÍCIO DA ADIÇÃO DE ESTILOS --- */
/* Estilos para a div dos links de navegação */
.navbar-links {
  flex-grow: 1; /* Faz os links ocuparem o espaço central */
  text-align: left;
  margin-left: 2rem;
}

/* Estilo para cada link (RouterLink vira <a>) */
.navbar-links a {
  font-weight: 600;
  color: #555;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

/* Efeito ao passar o mouse */
.navbar-links a:hover {
  background-color: #f4f4f4;
}

/* Estilo para o link da PÁGINA ATIVA */
.navbar-links a.router-link-exact-active {
  color: #000;
  background-color: #fce282; /* Um amarelo mais suave para o link ativo */
}
/* --- FIM DA ADIÇÃO DE ESTILOS --- */
</style>