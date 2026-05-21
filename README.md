# 🥑 Fruver Aguacates JJ - Sistema de Inventario y Ventas

## Ana Judith Velasquez y Maria del Mar Perez

## Proyecto de Curso

El sistema permite gestionar productos de un Fruver, controlar el inventario y registrar ventas de manera dinámica.

---

# 📌 Funcionalidades

## 📦 Gestión de productos

- Agregar productos
- Editar productos
- Desactivar productos
- Activar productos
- Visualizar stock disponible
- Control de estado (activo/inactivo)

---

## 💰 Gestión de ventas

- Registrar ventas
- Carrito de ventas
- Editar ventas
- Cancelar ventas
- Actualización automática del stock
- Validación de productos inactivos
- Validación de stock insuficiente
- Historial de ventas

---

# 🛠 Tecnologías utilizadas

- Node.js
- Express
- MySQL
- EJS
- Bootstrap
- Tailwind CSS
- CSS personalizado

---

# ⚙️ Instalación del proyecto

## 1. Clonar el repositorio

git clone URL_DEL_REPOSITORIO

## 2. Abrir el proyecto

Abrir la carpeta del proyecto en Visual Studio Code.

## 3. Instalar dependencias

En la terminal ejecutar:

- npm install

## 4. Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto y agregar:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD= TU CONTRASEÑA
DB_NAME=proyecto_curso
DB_PORT=3306

---

# 🗄 Base de datos

Crear la base de datos en MySQL:

CREATE DATABASE proyecto_curso;

## Tabla Productos

CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    precio DECIMAL(10,2),
    stock INT,
    estado BOOLEAN DEFAULT true
);

## Tabla Ventas

CREATE TABLE ventas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_venta INT,
    producto_id INT,
    cantidad INT,
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT true,

    FOREIGN KEY (producto_id)
    REFERENCES productos(id)
);

---

# ▶️ Ejecutar el sistema

En la terminal ejecutar:

- npm run dev

Luego abrir en el navegador:

http://localhost:3000