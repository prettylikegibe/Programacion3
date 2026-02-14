const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const controller = new CartController();

function ensureAuthFallback(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

router.get('/', ensureAuthFallback, controller.view.bind(controller));
router.post('/add', ensureAuthFallback, controller.add.bind(controller));
router.post('/remove', ensureAuthFallback, controller.remove.bind(controller));
router.post('/clear', ensureAuthFallback, controller.clear.bind(controller));

module.exports = router;
