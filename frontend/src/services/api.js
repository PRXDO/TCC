// src/services/api.js

import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// 1. Cria a instância base do Axios
const api = axios.create({
  baseURL: 'http://localhost:3001', // A URL do seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Configura o "Interceptor" de Requisição
// Isso é uma função que "intercepta" CADA requisição antes dela ser enviada
api.interceptors.request.use(
  (config) => {
    // 3. Pega a store de autenticação
    const authStore = useAuthStore();
    const token = authStore.token;

    // 4. Se o token existir, anexa ele no cabeçalho
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // Continua com a requisição
  },
  (error) => {
    // Em caso de erro na configuração da requisição
    return Promise.reject(error);
  }
);

// 3. (Opcional, mas recomendado) Interceptor de Resposta
// Podemos usar isso para deslogar o usuário se o token expirar (Erro 401)
api.interceptors.response.use(
  (response) => {
    // Qualquer status 2xx cai aqui
    return response;
  },
  (error) => {
    // Qualquer status fora do 2xx cai aqui
    if (error.response && error.response.status === 401) {
      // Se o backend disser "Token inválido/expirado" (401)
      const authStore = useAuthStore();
      authStore.logout(); // Desloga o usuário
      // Redireciona para o login (reload é o jeito mais simples aqui)
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);


// 4. Exporta a instância configurada
export default api;