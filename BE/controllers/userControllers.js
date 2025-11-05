import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "hola"; // Use a strong, secure key in production

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = async (request, response) => {
  try {
    console.log("createUser request.body =", request.body); // <-- importante para depurar

    const { newName, newEmail, newPasswd } = request.body || {};

    if (!newName || !newEmail || !newPasswd) {
      return response
        .status(400)
        .json({ message: "Faltan campos: newName, newEmail o newPasswd" });
    }

    // Asegurar que newPasswd es string antes de hashear
    const hashedPasswd = await bcrypt.hash(String(newPasswd), 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [newName, newEmail, hashedPasswd]
    );

    return response.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error("createUser error:", err);
    return response.status(500).json({ message: "Error al crear usuario" });
  }
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

const signIn = async (request, response) => {
  // Implementar lógica de inicio de sesión aquí
  try {
    const { email, password } = request.body;
    // Buscar usuario en la DB (ejemplo con pool)
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return response
        .status(401)
        .json({ message: "Usuario/contraseña inválidos" });
    const user = result.rows[0];
    // Comparar contraseña (suponiendo que user.passwd está hasheada)
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return response
        .status(401)
        .json({ message: "Usuario/contraseña inválidos" });
    // Firmar token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return response.json({ token });
  } catch (err) {
    console.error(err);
    return response.status(500).json({ message: "Error del servidor" });
  }

};

export { getUsers, getUserById, createUser, updateUser, deleteUser, signIn };
