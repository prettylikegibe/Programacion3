var express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productoController');
const controller = new ProductController();

function ensureAdminSession(req, res, next) {
	if (req.session && req.session.admin) return next();
	return res.redirect('/adminLogin');
}

// Public (or admin) listing
router.get('/', ensureAdminSession, controller.getAll.bind(controller));
router.get('/:id', ensureAdminSession, controller.getById.bind(controller));

// Create (from admin form)
router.post('/', ensureAdminSession, controller.create.bind(controller));

// Update via POST form (body.id)
router.post('/update', ensureAdminSession, controller.update.bind(controller));

// Delete via POST form (body.id)
router.post('/delete', ensureAdminSession, controller.delete.bind(controller));

// Also support RESTful methods if used by API clients
router.put('/:id', ensureAdminSession, controller.update.bind(controller));
router.delete('/:id', ensureAdminSession, controller.delete.bind(controller));

module.exports = router;