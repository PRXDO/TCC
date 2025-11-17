<script setup>
import { ref } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router'; // 2. Importamos o Router para redirecionar
import { useAuthStore } from '../stores/authStore'; // 3. Importamos nossa store Pinia

// --- Nossas variáveis reativas ---
const email = ref('');
const senha = ref('');
const mensagemErro = ref(null);
const carregando = ref(false); // Bônus: para desabilitar o botão durante o login

// --- Nossos "hooks" ---
const router = useRouter(); // Inicializa o router
const authStore = useAuthStore(); // Inicializa a store

// --- Nossa função de Login (agora com lógica!) ---
const fazerLogin = async () => {
  if (carregando.value) return; // Não faz nada se já estiver carregando

  carregando.value = true;
  mensagemErro.value = null;

  try {
    // 4. Chamar a API Backend!
    const response = await api.post('/login', {
      email: email.value,
      senha: senha.value
    });

    // 5. Se o login deu certo (sucesso!)
    const { token, usuario } = response.data;
    
    // 6. Usamos nossa store para salvar os dados globalmente
    authStore.setUsuarioLogado(token, usuario);

    // 7. Redirecionamos o usuário para a página principal
    // (Vamos criar a rota "/dashboard" no próximo passo)
    router.push('/dashboard'); 

  } catch (error) {
    // 8. Se o login deu errado (ex: senha inválida ou servidor fora)
    if (error.response && error.response.status === 401) {
      mensagemErro.value = 'Email ou senha inválidos.';
    } else {
      mensagemErro.value = 'Erro ao tentar conectar. Tente mais tarde.';
    }
    console.error('Erro no login:', error);
  } finally {
    // 9. Independente de sucesso ou falha, paramos o "carregando"
    carregando.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login</h1>
      <p>Acesse o sistema de manutenção</p>

      <form @submit.prevent="fazerLogin">
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="seu@email.com"
          />
        </div>

        <div class="form-group">
          <label for="senha">Senha</label>
          <input 
            type="password" 
            id="senha" 
            v-model="senha" 
            required 
            placeholder="********"
          />
        </div>

        <p v-if="mensagemErro" class="erro">{{ mensagemErro }}</p>

        <button 
  type="submit" 
  class="btn-login" 
  :disabled="carregando">
    {{ carregando ? 'Entrando...' : 'Entrar' }}
</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* No próximo passo, vamos estilizar isso com suas cores */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; /* Fundo temporário */
}
.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
h1 {
  margin-top: 0;
  color: #333;
}
p {
  color: #666;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Garante que o padding não quebre o layout */
}
.btn-login {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #FCD116; /* SUA COR! */
  color: #222; /* Texto escuro para o amarelo */
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-login:hover {
  background-color: #eab200; /* Um tom mais escuro do seu amarelo */
}
.erro {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>