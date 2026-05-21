require('dotenv').config();
const db = require('./config/db');
const saleRoutes = require('./routes/saleRoutes');
const express = require('express');
const path = require('path');

const app = express();
const carrito = require('./carrito');

// CONFIGURACIONES
app.set('port', 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const productRoutes = require('./routes/productRoutes');

app.use('/productos', productRoutes);
app.use('/ventas', saleRoutes);

// ARCHIVOS ESTÁTICOS (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.render('index');
});

// PRODUCTOS
app.get('/productos', (req, res) => {

    db.query('SELECT * FROM productos', (err, resultados) => {
        if (err) throw err;

        res.render('products/index', {
            productos: resultados
        });
    });

});

app.get('/eliminar/:id', (req, res) => {
  const { id } = req.params;

  db.query('UPDATE productos SET estado = false WHERE id = ?', [id], (err) => {
    if (err) throw err;

    res.redirect('/productos');
  });
});

app.get('/activar/:id', (req, res) => {

    const id = req.params.id;

    db.query(
        'UPDATE productos SET estado = true WHERE id = ?',
        [id],
        (err) => {

            if (err) throw err;

            res.redirect('/productos');
        }
    );

});

app.get('/editar/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) throw err;

    res.render('products/editar', {
      producto: result[0]
    });
  });
});

app.post('/actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;

  db.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, id],
    (err) => {
      if (err) throw err;

      res.redirect('/productos');
    }
  );
});

app.get('/cancelar-venta/:id', (req, res) => {

    const id = req.params.id;

    db.query(
        'SELECT * FROM ventas WHERE id = ?',
        [id],
        (err, ventas) => {

            if (err) throw err;

            const venta = ventas[0];

            if (!venta.estado) {

                return res.redirect('/ventas');

            }

            db.query(
                'UPDATE productos SET stock = stock + ? WHERE id = ?',
                [venta.cantidad, venta.producto_id],
                (err) => {

                    if (err) throw err;

                    db.query(
                        'UPDATE ventas SET estado = false WHERE id = ?',
                        [id],
                        (err) => {

                            if (err) throw err;

                            res.redirect('/ventas');

                        }
                    );

                }
            );

        }
    );

});

app.get('/editar-venta/:id', (req, res) => {

    const id = req.params.id;

    db.query(
        'SELECT * FROM ventas WHERE id = ?',
        [id],
        (err, ventas) => {

            if (err) throw err;

            const venta = ventas[0];

            if (!venta.estado) {

                return res.redirect('/ventas');

            }

            db.query(
                'SELECT * FROM productos WHERE estado = true',
                (err, productos) => {

                    if (err) throw err;

                    res.render('sales/editar', {
                        venta,
                        productos
                    });

                }
            );

        }
    );

});

app.post('/actualizar-venta/:id', (req, res) => {

    const id = req.params.id;

    const {
        producto_id,
        cantidad
    } = req.body;

    db.query(
        'SELECT * FROM ventas WHERE id = ?',
        [id],
        (err, ventas) => {

            if (err) throw err;

            const ventaAnterior = ventas[0];

            db.query(
                'UPDATE productos SET stock = stock + ? WHERE id = ?',
                [
                    ventaAnterior.cantidad,
                    ventaAnterior.producto_id
                ],
                (err) => {

                    if (err) throw err;

                    db.query(
                        'SELECT * FROM productos WHERE id = ?',
                        [producto_id],
                        (err, productos) => {

                            if (err) throw err;

                            const producto = productos[0];

                            if (producto.stock < cantidad) {

                                return res.send('❌ Stock insuficiente');

                            }

                            const total =
                                producto.precio * cantidad;

                            db.query(
                                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                                [cantidad, producto_id],
                                (err) => {

                                    if (err) throw err;

                                    db.query(
                                        `
                                        UPDATE ventas
                                        SET
                                        producto_id = ?,
                                        cantidad = ?,
                                        total = ?
                                        WHERE id = ?
                                        `,
                                        [
                                            producto_id,
                                            cantidad,
                                            total,
                                            id
                                        ],
                                        (err) => {

                                            if (err) throw err;

                                            res.redirect('/ventas');

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

app.post('/agregar-a-venta', (req, res) => {

    const {
        producto_id,
        cantidad
    } = req.body;

    db.query(
        'SELECT * FROM productos WHERE id = ?',
        [producto_id],
        (err, resultados) => {

            if (err) throw err;

            const producto = resultados[0];

            if (!producto.estado) {

                return res.redirect('/ventas?mensaje=inactivo');

            }

            if (producto.stock < cantidad) {

                return res.redirect('/ventas?mensaje=stock');

            }

            const subtotal =
                producto.precio * cantidad;

            carrito.push({

                producto_id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: parseInt(cantidad),
                subtotal

            });

            res.redirect('/ventas');

        }
    );

});

app.get('/quitar-del-carrito/:index', (req, res) => {

    const index = req.params.index;

    carrito.splice(index, 1);

    res.redirect('/ventas');

});

app.post('/finalizar-venta', (req, res) => {

    db.query(
        'SELECT MAX(numero_venta) AS ultimoNumero FROM ventas',
        (err, resultado) => {

            if (err) throw err;

            let nuevoNumero = 1;

            if (resultado[0].ultimoNumero) {

                nuevoNumero =
                    resultado[0].ultimoNumero + 1;

            }

            carrito.forEach(item => {

                db.query(
                    `
                    INSERT INTO ventas
                    (
                        numero_venta,
                        producto_id,
                        cantidad,
                        total
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        nuevoNumero,
                        item.producto_id,
                        item.cantidad,
                        item.subtotal
                    ]
                );

                db.query(
                    `
                    UPDATE productos
                    SET stock = stock - ?
                    WHERE id = ?
                    `,
                    [
                        item.cantidad,
                        item.producto_id
                    ]
                );

            });

            carrito.length = 0;

            res.redirect('/ventas?mensaje=ok');

        }
    );

});

// SERVIDOR
app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

module.exports = {
    carrito
};