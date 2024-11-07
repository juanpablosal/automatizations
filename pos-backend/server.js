//version : 0.0.0.0
//Autor: Juan Pablo Salazar rueda 


//declaracion de constantes. 
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config(); // Cargar variables de entorno
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Middleware
app.use(cors());
app.use(express.json());
const { body, validationResult } = require('express-validator');

// Secret para el token (usa uno seguro en producción)
const JWT_SECRET = 'secreto_super_seguro';

// Registro de usuario
app.post('/usuarios/registro', 
  body('usuario').notEmpty(), // La validación notEmpty() asegura que el campo usuario no esté vacío.
  body('password').isLength({ min: 6 }), // isLength({ min: 6 }) asegura que password tenga al menos 6 caracteres.
  async (req, res) => {
    console.log(req.body); // Verifica qué datos llegan al backend
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errors: errores.array() });
    }

    const { usuario, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        'INSERT INTO Usuarios (Username, Password) VALUES ($1, $2) RETURNING *',
        [usuario, hashedPassword]
      );      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  }
);

// Login de usuario
app.post('/usuarios/login', async (req, res) => {
  const { usuario, password } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(
      'SELECT * FROM Usuarios WHERE Username = $1',
      [usuario]
    );
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const usuarioDB = result.rows[0];
    const passwordCorrecta = await bcrypt.compare(password, usuarioDB.password);

    if (!passwordCorrecta) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuarioDB.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

//middleware para proteger rutas. 

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificar la conexión con la base de datos
pool.connect((err) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL', err);
  } else {
    console.log('Conexión exitosa con PostgreSQL');
  }
});

// Ruta básica para verificar que el servidor está activo
app.get('/', (req, res) => {
  res.send('¡Backend POS activo!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

//Registrar un producto 

app.post('/productos', async (req, res) => {
  const { nombre, descripcion, cantidad, precio, iva, categoria } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, cantidad, precio, iva, categoria) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, descripcion, cantidad, precio, iva, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el producto' });
  }
});

//Obtener todos los productos 
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

//Actualizar un producto:

app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, cantidad, precio, iva, categoria } = req.body;

  try {
    const result = await pool.query(
      `UPDATE productos SET nombre = $1, descripcion = $2, cantidad = $3, precio = $4, 
       iva = $5, categoria = $6 WHERE id = $7 RETURNING *`,
      [nombre, descripcion, cantidad, precio, iva, categoria, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
});

//Eliminar un producto:

app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Usuarios');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Usuarios WHERE ID = $1', [id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});





