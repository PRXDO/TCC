<script setup>
import Navbar from '../components/Navbar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="app-layout">
    <Navbar /> <main class="main-content">
      <RouterView /> 
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex-grow: 1; /* Faz o conteúdo principal ocupar todo o espaço restante */
  padding: 2rem;
  /* Usamos a cor de fundo que definimos no App.vue */
  background-color: #f4f4f4; 
}
</style>