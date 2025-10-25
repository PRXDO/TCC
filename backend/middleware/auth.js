// Importa a biblioteca
const jwt = require('jsonwebtoken');

// A MESMA chave secreta que usamos no login
const CHAVE_SECRETA = 'SECRET_KEY_MUITO_SECRETA';

// Este é o nosso middleware
const verificarToken = (req, res, next) => {
  try {
    // 1. Buscar o token. Ele vem no cabeçalho (Header) "Authorization"
    // O padrão é vir como: "Bearer TOKEN_GIGANTE_AQUI"
    const authHeader = req.headers['authorization'];
    
    // Se o header não existir, o usuário não enviou o token
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' }); // 401 = Não autorizado
    }

    // 2. Separar a palavra "Bearer" do token em si
    const partes = authHeader.split(' '); // Separa em ["Bearer", "TOKEN_GIGANTE"]
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato do token inválido' });
    }
    
    const token = partes[1];

    // 3. Verificar se o token é válido
    // jwt.verify() faz a mágica: decodifica o token usando a chave secreta.
    // Se a chave estiver errada ou o token tiver expirado, ele dá um erro (e vai pro CATCH).
    jwt.verify(token, CHAVE_SECRETA, (err, dadosDecodificados) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }

      // 4. Se o token é válido, anexamos os dados do usuário (id, perfil)
      // na própria requisição (req) para que a próxima função (o endpoint) possa usá-los.
      req.usuario = dadosDecodificados;

      // 5. Chamar next() para "passar para a próxima etapa" (o endpoint real)
      next();
    });

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Exportamos a função para usá-la no index.js
module.exports = verificarToken;