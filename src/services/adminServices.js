const bcrypt = require('bcrypt');
const db = require('../db/db');

function stripPassword(user) {
    if (!user) return null;
    const { password_hash, ...rest } = user;
    return rest;
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function get(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

class adminService {
    constructor() {
        this.db = db;
    }

    async registerAdmin(nombre, email, password = 'user', role = 'admin') {
        const passwordHash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO admin (nombre, email, password_hash, role) VALUES (?, ?, ?, ?)`;
        try {
            const result = await run(this.db, sql, [nombre, email, passwordHash, role]);
            const created = await get(this.db, 'SELECT id, nombre, email, created_at FROM admin WHERE id = ?', [result.lastID]);
            return stripPassword(created);
        } catch (err) {
            throw err;
        }
    }

    async authenticateAdmin(email, password) {
        const sql = `SELECT * FROM admin WHERE email = ?`;
        const user = await get(this.db, sql, [email]);
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;
        return stripPassword(user);
    }

    async getAdminById(id) {
        const sql = `SELECT id, nombre, email, created_at FROM admin WHERE id = ?`;
        const user = await get(this.db, sql, [id]);
        return user || null;
    }
}

module.exports = adminService;