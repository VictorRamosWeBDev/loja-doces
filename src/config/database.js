const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  // 1. Criar tabela de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante que a coluna status existe em bancos já criados anteriormente
  db.run("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'", (err) => {
    // Se der erro, a coluna já existe (comportamento esperado)
  });

  // 2. Criar tabela de produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      category TEXT
    )
  `, (err) => {
    if (err) return console.error("Erro ao criar tabela products:", err.message);

    // 3. Forçar a atualização das imagens limpando a tabela antes de reinserir
    db.run("DELETE FROM products", (err) => {
      if (err) return console.error("Erro ao limpar tabela products:", err.message);

      console.log("Atualizando lista de produtos com as imagens locais...");

      const stmt = db.prepare("INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)");
      
      const products = [
        {
          name: 'Biscoitos Amanteigados Tradicionais (200g)',
          description: 'Derretem na boca, feitos com manteiga pura de alta qualidade e um leve toque de baunilha.',
          price: 18.00,
          image: '/images/biscoito-tradicional.jpg',
          category: 'biscoitos'
        },
        {
          name: 'Biscoitos Amanteigados com Goiabada (200g)',
          description: 'O clássico casadinho amanteigado recheado com goiabada cascão cremosa.',
          price: 22.00,
          image: '/images/biscoito-goiabada.jpg',
          category: 'biscoitos'
        },
        {
          name: 'Bolo Red Velvet com Ninho (Kg)',
          description: 'Massa aveludada vermelha com generosas camadas de recheio de Leite Ninho.',
          price: 85.00,
          image: '/images/red-velvet.jpg',
          category: 'bolos'
        },
        {
          name: 'Bolo de Festa Chocolate Trufado (Kg)',
          description: 'Massa pão de ló super fofinha com recheio de trufa intensa 50% cacau e ganache.',
          price: 90.00,
          image: '/images/bolo-chocolate.jpg',
          category: 'bolos'
        },
        {
          name: 'Bolo Vulcão de Cenoura com Brigadeiro',
          description: 'Bolo de cenoura fofinho com uma explosão de cobertura de brigadeiro gourmet.',
          price: 65.00,
          image: '/images/bolo-cenoura.jpg',
          category: 'bolos'
        },
        {
          name: 'Caixa de Brigadeiros Gourmet (12 un)',
          description: 'Seleção de brigadeiros artesanais feitos com chocolate nobre.',
          price: 36.00,
          image: '/images/caixa-brigadeiros.jpg',
          category: 'docinhos'
        }
      ];

      products.forEach(p => {
        stmt.run(p.name, p.description, p.price, p.image, p.category);
      });
      
      stmt.finalize();
    });
  });
});

module.exports = db;