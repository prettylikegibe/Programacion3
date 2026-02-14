const path = require('path');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database(
    path.resolve(__dirname, '../db', 'db.db'),
     error => {
        if (error) {
            return console.log(error.message);
        }else{
            console.log('Conexión a la base de datos establecida.');
        }

        const admin = `CREATE TABLE IF NOT EXISTS admin (
                        id INTEGER PRIMARY KEY AUTOINCREMENT, 
                        nombre VARCHAR(100) NOT NULL, 
                        email TEXT UNIQUE,
                        password_hash TEXT,
                        role TEXT NOT NULL DEFAULT 'admin',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );`
        
        const productos = `CREATE TABLE IF NOT EXISTS productos (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            nombre VARCHAR(100) NOT NULL,
                            codigo VARCHAR(50) UNIQUE,
                            descripcion TEXT,
                            stock INTEGER NOT NULL,
                            precio REAL NOT NULL);`

        const usuarios= `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
        
        const carts = `CREATE TABLE IF NOT EXISTS carts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );`

        const cart_items = `CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY(cart_id) REFERENCES carts(id),
            FOREIGN KEY(product_id) REFERENCES productos(id)
        );`
            
        db.run(admin, (error) => {
            if (error) {
                return console.log(error);
            }
            
        });

        db.run(productos, (error) => {
            if (error) {
                return console.log(error);
            }
            
        });

        db.run(usuarios, (error) => {
            if (error) {
                return console.log(error);
            }
            
        });

        db.run(carts, (error) => {
            if (error) {
                return console.log(error);
            }
        });

        db.run(cart_items, (error) => {
            if (error) {
                return console.log(error);
            }
        });
    })

module.exports = db