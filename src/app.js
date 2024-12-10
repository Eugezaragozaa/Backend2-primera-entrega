import express from "express";
import routes from "./routes/index.js";
import __dirname from "./dirname.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import viewsRoutes from "./routes/views.routes.js";
import { connectMongoDB } from "./config/mongoDB.config.js";
import { User } from "./models/user.js";  // Importamos el modelo User
import bcrypt from 'bcrypt';  // Importamos bcrypt para hash de las contraseñas

const app = express();

// Conectar a MongoDB
connectMongoDB();

// Middleware y configuración de Handlebars
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Rutas de la API
app.use("/api", routes);

// Ruta de las vistas
app.use("/", viewsRoutes);

const httpServer = app.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");

  // Crear usuarios de prueba (si no existen)
  createTestUsers();
});

// Función para crear usuarios de prueba si no existen en la base de datos
async function createTestUsers() {
  const users = [
    {
      first_name: "Melanie",
      last_name: "Gómez",
      email: "melanie.gomez@example.com",
      age: 25,
      password: "melanie1234",
    },
    {
      first_name: "Tomas",
      last_name: "Martínez",
      email: "tomas.martinez@example.com",
      age: 30,
      password: "tomas1234",
    },
    {
      first_name: "Laura",
      last_name: "Fernández",
      email: "laura.fernandez@example.com",
      age: 28,
      password: "laura1234",
    },
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      // Si el usuario no existe, lo creamos
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(user.password, salt);
      const newUser = new User({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        password: hashedPassword,  // Guardamos la contraseña hasheada
      });

      await newUser.save();
      console.log(`Usuario ${user.first_name} ${user.last_name} creado`);
    } else {
      console.log(`El usuario ${user.first_name} ${user.last_name} ya existe`);
    }
  }
}

// Configuración de Socket.io
export const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("Nuevo usuario Conectado");
});