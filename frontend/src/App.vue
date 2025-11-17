<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Vamos limpar o CSS global que vem por padrão.
   Deixe a tag <style> vazia ou coloque estilos globais aqui,
   como a cor de fundo do app. */
body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background-color: #f4f4f4; /* Um cinza claro de fundo, podemos ajustar */
}
</style>