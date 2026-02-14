const express = require('express');
const router = express.Router();
const UserService = require('./userService');
const userService = new UserService();
const AdminService = require('./adminServices');
const adminService = new AdminService();
const ProductosService = require('./productoService');
const productoService = new ProductosService();

const ensureAdmin = require('../../middleware/ensureAdmin');

function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// Renders
router.get('/registro', (req, res) => {
  res.render('registro');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/adminLogin', (req, res) => {
  res.render('adminLogin');
});

router.get('/adminRegister', (req, res) => {
  res.render('adminRegistro');
});

router.get('/admin', ensureAdmin, (req, res) => {
  // Load productos for admin view
  (async () => {
    try {
      const productos = await productoService.getAll({});
      return res.render('admin', { admin: req.session.admin, productos, filters: {} });
    } catch (err) {
      console.error('Error cargando productos para admin:', err.message);
      return res.render('admin', { admin: req.session.admin, productos: [], filters: {} });
    }
  })();
});

// Register (form)
router.post('/adminRegister', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const role = rol || 'Admin';
    const admin = await adminService.registerAdmin(nombre, email, password, role);
    return res.redirect('/adminLogin');
  } catch (err) {
    if (err && err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email en uso' });
    }
    return res.status(400).json({ error: err.message });
  }
});


router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const user = await userService.registerUser(nombre, email, password);
    return res.redirect('/login');
  } catch (err) {
    if (err && err.message && err.message.includes('UNIQUE')) {
      return res.status(409).render('registro', { error: 'Email en uso' });
    }
    return res.status(400).render('registro', { error: err.message });
  }
});

// Admin login (form)
router.post('/adminLogin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await adminService.authenticateAdmin(email, password);
    if (!admin) return res.status(401).render('adminLogin', { error: 'Credenciales inválidas' });
    req.session.admin = admin;
    console.log('Admin autenticado:', admin);
    return res.redirect('/admin');
  } catch (err) {
    return res.status(500).render('adminLogin', { error: 'Error de autenticación' });
  }
});

// Login (form)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    if (!user) return res.status(401).render('login', { error: 'Credenciales inválidas' });
    // Persist user in session
    req.session.user = user;
    return res.redirect('/usuario');
  } catch (err) {
    return res.status(500).render('login', { error: 'Error de autenticación' });
  }
});


// Protected routes
router.get('/usuario', ensureAuthenticated, async (req, res) => {
  try {
    const filters = {
      nombre: req.query.nombre,
      precio: req.query.precio,
      codigo: req.query.codigo,
      descripcion: req.query.descripcion,
      precioMin: req.query.precioMin,
      precioMax: req.query.precioMax,
      stock: req.query.stock,
      stockMin: req.query.stockMin,
      stockMax: req.query.stockMax,
    };
    const productos = await productoService.getAll(filters);
    res.render('usuario', { user: req.session.user, productos, filters: req.query });
  } catch (err) {
    console.error('Error cargando productos:', err.message);
    res.render('usuario', { user: req.session.user, productos: [], filters: {} });
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      return res.redirect('/login');
    });
  } else {
    return res.redirect('/login');
  }
});

router.get('/admin/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      return res.redirect('/adminLogin');
    });

  } else {
    return res.redirect('/adminLogin');
  } 
});



module.exports = router;