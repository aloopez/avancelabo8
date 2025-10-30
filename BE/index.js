import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import db from './data/index.js';

const app = express();
const PORT = 5001;
const JWT_SECRET = "hola"; // Use a strong, secure key in production

app.use(bodyParser.json());
app.use(cors());

const generarHashEjemplo = async () => {
  const saltRounds = 10;
  const plainTextPassword = "1234";
  const hash = await bcrypt.hash(plainTextPassword, saltRounds);
  console.log(`Hashed password for '${plainTextPassword}': ${hash}`);
};

generarHashEjemplo();


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Routes
app.post("/signIn", async (req, res) => {

  try {
    const { email, password } = req.body;
    // Buscar usuario en la DB (ejemplo con pool)
    const result = await db.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Usuario/contraseña inválidos' });
    const user = result.rows[0];
    // Comparar contraseña (suponiendo que user.passwd está hasheada)
    const match = await bcrypt.compare(password, user.passwd);
    if (!match) return res.status(401).json({ message: 'Usuario/contraseña inválidos' });
    // Firmar token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

app.get("/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected data accessed", user: req.user });
});

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);



