const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');

const db = require('./src/config/database');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// SEGURANÇA (HELMET)
// ============================================================
// Protege os cabeçalhos HTTP
app.use(helmet({
  contentSecurityPolicy: false // Ajuste para não bloquear imagens externas/scripts inline se usares
}));

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// SESSÃO / AUTENTICAÇÃO
// ============================================================

app.use(session({
  secret: process.env.SESSION_SECRET || 'evye-doces-chave-temporaria-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 horas
    secure: process.env.NODE_ENV === 'production', // HTTPS em produção (Render)
    httpOnly: true // Impede acesso ao cookie via scripts JS do cliente
  }
}));

// ============================================================
// CREDENCIAIS DO ADMINISTRADOR
// ============================================================

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || '123456';

// ============================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.authenticated = true;

    return res.json({
      success: true
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Usuário ou senha incorretos!'
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao encerrar sessão.'
      });
    }

    res.json({
      success: true
    });
  });
});

// Verificar autenticação
app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({
      authenticated: true
    });
  }

  return res.json({
    authenticated: false
  });
});

// ============================================================
// PROTEÇÃO DO PAINEL ADMIN
// ============================================================

app.get('/admin.html', (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }

  return res.redirect('/login.html');
});

// ============================================================
// ARQUIVOS ESTÁTICOS
// ============================================================

// Pasta PUBLIC inteira
app.use(express.static(path.join(__dirname, 'public')));

// Pasta de imagens explicitamente
app.use(
  '/images',
  express.static(path.join(__dirname, 'public', 'images'))
);

app.use(
  '/imagens',
  express.static(path.join(__dirname, 'public', 'images'))
);

// ============================================================
// API
// ============================================================

app.use('/api', apiRoutes);

// ============================================================
// ROTA PRINCIPAL
// ============================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// TESTE DA IMAGEM DO HERO
// ============================================================

app.get('/teste-imagem', (req, res) => {
  const imagem = path.join(
    __dirname,
    'public',
    'images',
    'bolo-destaque.jpg'
  );

  res.sendFile(imagem, (err) => {
    if (err) {
      console.error('❌ Erro ao carregar bolo-destaque.jpg:');
      console.error(err);

      if (!res.headersSent) {
        res.status(404).send(`
          <h1>Imagem não encontrada</h1>
          <p>O arquivo esperado é:</p>
          <code>${imagem}</code>
        `);
      }
    }
  });
});

// ============================================================
// TRATAMENTO DE ERROS
// ============================================================

app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor.'
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🍰 ============================================');
  console.log('🍰        EVYE DOCES - SERVIDOR ONLINE');
  console.log('🍰 ============================================');
  console.log('');
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
  console.log(`🖼️ Imagens:  http://localhost:${PORT}/images/`);
  console.log(`🍰 Hero:     http://localhost:${PORT}/images/bolo-destaque.jpg`);
  console.log(`🔐 Admin:    http://localhost:${PORT}/admin.html`);
  console.log('');
  console.log('📁 Pasta pública:');
  console.log(path.join(__dirname, 'public'));
  console.log('');
  console.log('🍰 ============================================');
  console.log('');
});