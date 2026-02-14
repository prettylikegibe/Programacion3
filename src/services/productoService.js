var db = require('../db/db');

class productoService {
    constructor() {
        this.db = db;
    }

    getAll (filters = {}){
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM productos';
            const clauses = [];
            const params = [];

            // text search: nombre applies to nombre, descripcion or codigo
            if (filters.nombre) {
                const term = `%${filters.nombre}%`;
                clauses.push('(nombre LIKE ? OR descripcion LIKE ? OR codigo LIKE ?)');
                params.push(term, term, term);
            }

            // exact codigo filter
            if (filters.codigo) {
                clauses.push('codigo = ?');
                params.push(filters.codigo);
            }

            // numeric filters (precio and stock ranges)
            if (filters.precioMin !== undefined && filters.precioMin !== null && filters.precioMin !== '') {
                const v = parseFloat(filters.precioMin);
                if (!isNaN(v)) {
                    clauses.push('precio >= ?');
                    params.push(v);
                }
            }
            if (filters.precioMax !== undefined && filters.precioMax !== null && filters.precioMax !== '') {
                const v = parseFloat(filters.precioMax);
                if (!isNaN(v)) {
                    clauses.push('precio <= ?');
                    params.push(v);
                }
            }
            if (filters.stockMin !== undefined && filters.stockMin !== null && filters.stockMin !== '') {
                const v = parseInt(filters.stockMin, 10);
                if (!isNaN(v)) {
                    clauses.push('stock >= ?');
                    params.push(v);
                }
            }
            if (filters.stockMax !== undefined && filters.stockMax !== null && filters.stockMax !== '') {
                const v = parseInt(filters.stockMax, 10);
                if (!isNaN(v)) {
                    clauses.push('stock <= ?');
                    params.push(v);
                }
            }

            if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
            sql += ' ORDER BY id DESC';

            this.db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
 

    getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    create({ nombre, codigo, descripcion, stock, precio }) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO productos (nombre, codigo, descripcion, stock, precio) VALUES (?, ?, ?, ?, ?)';
            this.db.run(sql, [nombre, codigo, descripcion, stock, precio], function (err) {
                if (err) return reject(err);
                const id = this.lastID;
                resolve({ id, nombre, codigo, descripcion, stock, precio });
            });
        });
    }

    update(id, fields = {}) {
        return new Promise((resolve, reject) => {
            const sets = [];
            const params = [];
            if (fields.nombre !== undefined) {
                sets.push('nombre = ?');
                params.push(fields.nombre);
            }
            if (fields.codigo !== undefined) {
                sets.push('codigo = ?');
                params.push(fields.codigo);
            }
            if (fields.descripcion !== undefined) {
                sets.push('descripcion = ?');
                params.push(fields.descripcion);
            }
            if (fields.stock !== undefined) {
                sets.push('stock = ?');
                params.push(fields.stock);
            }
            if (fields.precio !== undefined) {
                sets.push('precio = ?');
                params.push(fields.precio);
            }
            if (!sets.length) return resolve(null);
            params.push(id);
            const sql = `UPDATE productos SET ${sets.join(', ')} WHERE id = ?`;
            this.db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM productos WHERE id = ?', [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }

}

module.exports = productoService;