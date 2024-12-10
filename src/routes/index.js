import { Router } from "express";
import productsRouter from "./products.routes.js";
import cartsRouter from "./carts.routes.js";
import passport from 'passport';  // Importamos passport
import jwt from 'jsonwebtoken';  // Importamos jsonwebtoken para crear el JWT
//import { User } from '../models/user.js';  Importar el modelo User

const router = Router();

// Ruta de registro
router.post('/sessions/register', passport.authenticate('register', { session: false }), (req, res) => {
  // En caso de éxito, se guarda el usuario y se devuelve un JWT
    const { email, first_name, last_name, age } = req.body;
    const payload = { email, first_name, last_name, age, id: req.user._id };

  // Crear JWT (puedes usar una clave secreta más segura en producción)
    const token = jwt.sign(payload, 'secretJWT', { expiresIn: '1h' });

  // Establecer el JWT como cookie
  res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });  // 1 hora
    res.status(200).json({ message: 'Usuario registrado correctamente', token });
});

// Ruta de login
router.post('/sessions/login', passport.authenticate('login', { session: false }), (req, res) => {
  // Crear JWT
    const { email, first_name, last_name, age } = req.user;
    const payload = { email, first_name, last_name, age, id: req.user._id };

  // Crear el token
    const token = jwt.sign(payload, 'secretJWT', { expiresIn: '1h' });

  // Establecer el JWT como cookie
  res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // 1 hora
    res.status(200).json({ message: 'Login exitoso', token });
});

// Ruta current para obtener los datos del usuario autenticado
router.get('/sessions/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
    }
    res.status(200).json({ user: req.user });
});

// Rutas de productos
router.use("/products", productsRouter);

// Rutas de carritos
router.use("/carts", cartsRouter);

export default router;