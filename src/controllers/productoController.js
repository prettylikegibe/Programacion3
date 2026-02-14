const express = require('express');
const router = express.Router();
const ProductosService = require('../services/productoService');

class ProductoController {
    constructor() {
        this.service = new ProductosService();
    }

    async getAll(req, res) {
        try {
            const filters = {
                nombre: req.query.nombre,
                codigo: req.query.codigo,
                descripcion: req.query.descripcion,
                precio: req.query.precio,
                precioMin: req.query.precioMin,
                precioMax: req.query.precioMax,
                stock: req.query.stock,
                stockMin: req.query.stockMin,
                stockMax: req.query.stockMax,
            };
            const productos = await this.service.getAll(filters);
            res.json(productos);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const id = req.params.id || req.body.id;
            const producto = await this.service.getById(id);
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
            res.json(producto);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { nombre, codigo, descripcion, stock, precio } = req.body;
            if (!nombre || stock === undefined || precio === undefined) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }
            const nuevo = await this.service.create({ nombre, codigo, descripcion, stock, precio });
            console.log(nuevo);
            res.status(201).json(nuevo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id || req.body.id;
            const fields = {};
            if (req.body.nombre !== undefined) fields.nombre = req.body.nombre;
            if (req.body.codigo !== undefined) fields.codigo = req.body.codigo;
            if (req.body.descripcion !== undefined) fields.descripcion = req.body.descripcion;
            if (req.body.stock !== undefined) fields.stock = req.body.stock;
            if (req.body.precio !== undefined) fields.precio = req.body.precio;

            if (!Object.keys(fields).length) 
                return res.status(400).json({ error: 'Nada para actualizar' });

            const updated = await this.service.update(id, fields);
            if (updated === null) 
                return res.status(400).json({ error: 'Nada para actualizar' });

            if (!updated) 
                return res.status(404).json({ error: 'Producto no encontrado' });
            console.log(updated);
            res.status(200).json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id || req.body.id;
            const deleted = await this.service.delete(id);
            if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
            console.log(deleted);
            res.status(200).json({ message: 'Producto eliminado correctamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = ProductoController;
