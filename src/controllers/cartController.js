const ProductosService = require('../services/productoService');
const productoService = new ProductosService();
const CartService = require('../services/cartService');
const cartService = new CartService();

class CartController {
  async view(req, res) {
    // If user logged and no session cart, try to load from DB
    if (req.session && req.session.user && (!req.session.cart || !Array.isArray(req.session.cart.items) || req.session.cart.items.length === 0)) {
      try {
        const saved = await cartService.getCartByUserId(req.session.user.id);
        if (saved && saved.items && saved.items.length) {
          req.session.cart = { items: saved.items };
        }
      } catch (err) {
        console.error('Error cargando carrito desde DB:', err.message);
      }
    }

    const cart = req.session.cart || { items: [] };
    // Enrich items with product data
    const detailed = await Promise.all(cart.items.map(async it => {
      const p = await productoService.getById(it.id);
      return {
        id: it.id,
        nombre: p ? p.nombre : 'Producto no encontrado',
        precio: p ? p.precio : 0,
        cantidad: it.cantidad || 1,
        subtotal: (p ? p.precio : 0) * (it.cantidad || 1)
      };
    }));
    const total = detailed.reduce((s, i) => s + i.subtotal, 0);
    res.render('carrito', { user: req.session.user, items: detailed, total });
  }

  // body: { id, cantidad } or { items: [{id, cantidad}, ...] }
  async add(req, res) {
    if (!req.session) return res.status(400).json({ error: 'Session required' });
    const payload = req.body;
    req.session.cart = req.session.cart || { items: [] };

    const toAdd = [];
    if (Array.isArray(payload.items)) {
      payload.items.forEach(i => toAdd.push({ id: i.id, cantidad: parseInt(i.cantidad || 1, 10) }));
    } else if (payload.id) {
      toAdd.push({ id: payload.id, cantidad: parseInt(payload.cantidad || 1, 10) });
    }

    toAdd.forEach(add => {
      const exists = req.session.cart.items.find(it => String(it.id) === String(add.id));
      if (exists) {
        exists.cantidad = (exists.cantidad || 0) + (add.cantidad || 1);
      } else {
        req.session.cart.items.push({ id: add.id, cantidad: add.cantidad || 1 });
      }
    });

    // Save session then respond
    req.session.save(async err => {
      if (err) console.error('Session save error:', err);

      // persist if user
      if (req.session.user && req.session.user.id) {
        try {
          await cartService.saveCart(req.session.user.id, req.session.cart.items);
        } catch (e) { console.error('Error guardando carrito en DB:', e.message); }
      }

      // compute total count
      const count = req.session.cart.items.reduce((s, it) => s + (parseInt(it.cantidad || 0, 10) || 0), 0);
      const isAjax = req.xhr || (req.headers && (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) || req.headers['x-requested-with'] === 'XMLHttpRequest';
      if (isAjax) return res.json({ count });
      return res.redirect('/carrito');
    });
  }

  // body: { id } to remove entirely OR { id, cantidad } to decrease OR { items: [...] }
  async remove(req, res) {
    if (!req.session || !req.session.cart) return res.redirect('/carrito');
    const payload = req.body;
    const items = req.session.cart.items || [];

    const toRemove = [];
    if (Array.isArray(payload.items)) {
      payload.items.forEach(i => toRemove.push({ id: i.id, cantidad: i.cantidad ? parseInt(i.cantidad, 10) : null }));
    } else if (payload.id) {
      toRemove.push({ id: payload.id, cantidad: payload.cantidad ? parseInt(payload.cantidad, 10) : null });
    }

    toRemove.forEach(rem => {
      const idx = items.findIndex(it => String(it.id) === String(rem.id));
      if (idx === -1) return;
      if (rem.cantidad == null) {
        // remove entirely
        items.splice(idx, 1);
      } else {
        items[idx].cantidad = (items[idx].cantidad || 0) - rem.cantidad;
        if (items[idx].cantidad <= 0) items.splice(idx, 1);
      }
    });

    req.session.cart.items = items;
    req.session.save(async err => {
      if (err) console.error('Session save error:', err);

      if (req.session.user && req.session.user.id) {
        try { await cartService.saveCart(req.session.user.id, req.session.cart.items); } catch(e){ console.error('Error guardando carrito en DB:', e.message); }
      }

      const count = req.session.cart.items.reduce((s, it) => s + (parseInt(it.cantidad || 0, 10) || 0), 0);
      const isAjax = req.xhr || (req.headers && (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) || req.headers['x-requested-with'] === 'XMLHttpRequest';
      if (isAjax) return res.json({ count });
      return res.redirect('/carrito');
    });
  }

  clear(req, res) {
    if (req.session) {
      req.session.cart = { items: [] };
      req.session.save(async err => {
        if (err) console.error('Session save error:', err);
        if (req.session.user && req.session.user.id) {
          try { await cartService.clearCart(req.session.user.id); } catch(e){ console.error('Error limpiando carrito en DB:', e.message); }
        }
        const isAjax = req.xhr || (req.headers && (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) || req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) return res.json({ count: 0 });
        return res.redirect('/carrito');
      });
    } else {
      return res.redirect('/carrito');
    }
  }
}

module.exports = CartController;
