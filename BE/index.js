import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/userRoutes.js";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());
app.use(cors());

/* const generarHashEjemplo = async () => {
  const saltRounds = 10;
  const plainTextPassword = "1234";
  const hash = await bcrypt.hash(plainTextPassword, saltRounds);
  console.log(`Hashed password for '${plainTextPassword}': ${hash}`);
};

generarHashEjemplo(); */ // Descomentar para generar un hash de ejemplo

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

app.use("/api", router);

app.get("/api/protected", verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected data accessed", user: req.user });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
