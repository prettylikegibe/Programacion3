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

class UserService {
    constructor() {
        this.db = db;
    }

    async registerUser(nombre, email, password = 'user') {
        const passwordHash = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)`;
        try {
            const result = await run(this.db, sql, [nombre, email, passwordHash]);
            const created = await get(this.db, 'SELECT id, nombre, email, created_at FROM users WHERE id = ?', [result.lastID]);
            return stripPassword(created);
        } catch (err) {
            throw err;
        }
    }

    async authenticateUser(email, password) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const user = await get(this.db, sql, [email]);
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;
        return stripPassword(user);
    }

    async authenticateUser(email, password) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const user = await get(this.db, sql, [email]);
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;
        return stripPassword(user);
    }

    async getUserById(id) {
        const sql = `SELECT id, nombre, email, created_at FROM users WHERE id = ?`;
        const user = await get(this.db, sql, [id]);
        return user || null;
    }
}

module.exports = UserService;