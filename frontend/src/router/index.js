import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AppLayout from '../layouts/AppLayout.vue'

// 1. Importamos a nossa store
//    (Nota: Não podemos usar useAuthStore() aqui no topo, 
//     pois o Pinia ainda não foi inicializado. Faremos isso dentro do beforeEach)
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard' // <-- MUDANÇA: Agora o padrão é o dashboard
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { publica: true }
    },
    
    // --- ROTAS PROTEGIDAS (DENTRO DO LAYOUT) ---
    {
      path: '/app', // <-- Vamos agrupar tudo sob '/app'
      component: AppLayout, // <-- O PAI é o nosso Layout
      // O guarda de rotas vai proteger esta rota pai e todas as filhas
      children: [
        {
          path: '/dashboard', // Rota filha 1
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue')
        },
        {
          path: '/app/chamados/novo',
          name: 'novo-chamado',
          component: () => import('../views/NovoChamadoView.vue')
        },
        {
          // O ":id" é um parâmetro dinâmico!
          path: '/app/chamados/:id',
          name: 'detalhes-chamado',
          component: () => import('../views/DetalhesChamadoView.vue')
        },
        {
          path: '/app/admin',
          name: 'admin',
          component: () => import('../views/AdminView.vue')
        }
      ]
    }
  ]
})

// --- INÍCIO DO GUARDA DE ROTAS ---
router.beforeEach((to, from, next) => {
  // 4. Inicializamos a store AQUI DENTRO
  const authStore = useAuthStore();
  
  // 5. Verifica se a rota é pública
  const ehRotaPublica = to.meta.publica;

  // 6. Se o usuário ESTÁ LOGADO
  if (authStore.estaLogado) {
    
    // Se ele está logado e tenta acessar /login, redireciona para o dashboard
    if (ehRotaPublica) {
      next({ path: '/dashboard' });
    } else {
      // Se está logado e acessando uma rota protegida, permite
      next();
    }
    
  // 7. Se o usuário NÃO ESTÁ LOGADO
  } else {
    
    // Se não está logado e tenta acessar uma rota protegida, redireciona para /login
    if (!ehRotaPublica) {
      next({ path: '/login' });
    } else {
      // Se não está logado e acessando uma rota pública (ex: /login), permite
      next();
    }
  }
});
// --- FIM DO GUARDA DE ROTAS ---

export default router