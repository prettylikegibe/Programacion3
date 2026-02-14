var express = require('express');

module.exports = function ensureAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();

  // Si está autenticado como usuario normal, denegar acceso o redirigir
  if (req.session && req.session.user) {
    return res.status(403).render('adminLogin', { error: 'Acceso denegado: se requiere cuenta de administrador' });
  }

  // No autenticado: enviar a login de admin
  return res.redirect('/adminLogin');
};
