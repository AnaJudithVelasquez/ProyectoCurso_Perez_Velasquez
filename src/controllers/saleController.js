const db = require('../config/db');
const carrito = require('../carrito');

// MOSTRAR VENTAS
exports.getSales = (req, res) => {

    
    db.query(
        'SELECT * FROM productos',
        (err, productos) => {

            if (err) throw err;

            
            db.query(
                `SELECT ventas.*, productos.nombre 
                 FROM ventas
                 INNER JOIN productos 
                 ON ventas.producto_id = productos.id
                 ORDER BY ventas.fecha DESC`,
                (err, ventas) => {

                    if (err) throw err;

                res.render('sales/index', {
                   productos,
                   ventas,
                   carrito,
                   mensaje: req.query.mensaje
                    });

                }
            );

        }
    );

};

// REGISTRAR VENTA
exports.addSale = (req, res) => {

    const { producto_id, cantidad } = req.body;

    
    db.query(
        'SELECT * FROM productos WHERE id = ?',
        [producto_id],
        (err, resultado) => {

            if (err) throw err;

            const producto = resultado[0];

            
            if (!producto.estado) {

                return res.redirect('/ventas?mensaje=inactivo');
            }

            
            if (cantidad > producto.stock) {

                return res.redirect('/ventas?mensaje=stock');
            }

            
            const total = producto.precio * cantidad;

            
            db.query(
                'INSERT INTO ventas(producto_id, cantidad, total) VALUES (?, ?, ?)',
                [producto_id, cantidad, total],
                (err) => {

                    if (err) throw err;

                    
                    db.query(
                        'UPDATE productos SET stock = stock - ? WHERE id = ?',
                        [cantidad, producto_id],
                        (err) => {

                            if (err) throw err;

                            res.redirect('/ventas?mensaje=ok');
                        }
                    );

                }
            );

        }
    );

};