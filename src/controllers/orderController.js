const db = require('../config/database');

// Buscar todos os pedidos
exports.getAllOrders = (req, res) => {
  const sql = 'SELECT * FROM orders ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pedidos:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Criar um novo pedido
exports.createOrder = (req, res) => {
  const { customer_name, customer_address, items, total } = req.body;
  
  const sql = `INSERT INTO orders (customer_name, customer_address, items, total, status) VALUES (?, ?, ?, ?, 'pending')`;
  const itemsString = typeof items === 'string' ? items : JSON.stringify(items);

  db.run(sql, [customer_name, customer_address, itemsString, total], function(err) {
    if (err) {
      console.error('Erro ao criar pedido:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Pedido criado com sucesso!' });
  });
};

// Atualizar status do pedido (pending / completed)
exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'ID e status são obrigatórios.' });
  }

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.run(sql, [status, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar status no SQLite:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Status atualizado com sucesso!' });
  });
};

// Eliminar/Remover pedido do banco de dados
exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM orders WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      console.error('Erro ao remover pedido:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Pedido removido com sucesso!' });
  });
};