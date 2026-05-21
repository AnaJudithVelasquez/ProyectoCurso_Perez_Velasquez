const db = require('../config/db');

// OBTENER PRODUCTOS
exports.getProducts = (req, res) => {
    const sql = 'SELECT * FROM productos';

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Error al obtener productos');
        }

        res.render('products/index', { productos: results });
    });
};

// CREAR PRODUCTO
exports.addProduct = (req, res) => {
    const { nombre, precio, stock } = req.body;

    const sql = 'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)';

    db.query(sql, [nombre, precio, stock], (err) => {
        if (err) {
            console.error(err);
            return res.send('Error al guardar');
        }

        res.redirect('/productos');
    });
};