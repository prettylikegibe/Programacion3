const db = require('../db/db');

class CartService {
  async getCartByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT c.id as cart_id, ci.product_id, ci.cantidad
                   FROM carts c
                   LEFT JOIN cart_items ci ON ci.cart_id = c.id
                   WHERE c.user_id = ?`;
      db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return resolve({ cartId: null, items: [] });
        const cartId = rows[0].cart_id;
        const items = rows.filter(r => r.product_id).map(r => ({ id: r.product_id, cantidad: r.cantidad }));
        resolve({ cartId, items });
      });
    });
  }

  async saveCart(userId, items = []) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM carts WHERE user_id = ?', [userId], (err, row) => {
        if (err) return reject(err);
        const saveItems = (cartId) => {
          // remove existing items
          db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId], (delErr) => {
            if (delErr) return reject(delErr);
            if (!items || items.length === 0) return resolve({ cartId, items: [] });
            const stmt = db.prepare('INSERT INTO cart_items (cart_id, product_id, cantidad) VALUES (?, ?, ?)');
            items.forEach(it => {
              stmt.run(cartId, it.id, it.cantidad || 1);
            });
            stmt.finalize(err2 => {
              if (err2) return reject(err2);
              db.run('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cartId], ()=> resolve({ cartId, items }));
            });
          });
        };

        if (row && row.id) {
          saveItems(row.id);
        } else {
          db.run('INSERT INTO carts (user_id) VALUES (?)', [userId], function(insertErr) {
            if (insertErr) return reject(insertErr);
            saveItems(this.lastID);
          });
        }
      });
    });
  }

  async clearCart(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM carts WHERE user_id = ?', [userId], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve();
        db.run('DELETE FROM cart_items WHERE cart_id = ?', [row.id], (delErr) => {
          if (delErr) return reject(delErr);
          db.run('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [row.id], () => resolve());
        });
      });
    });
  }
}

module.exports = CartService;
