import {Pool} from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-curly-sound-ahcrxe5b-pooler.c-3.us-east-1.aws.neon.tech',
  database: 'neondb',
  password: 'npg_WUmQdXwNZ2f6',
  ssl: {
    rejectUnauthorized: false
  }
});

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = async(request, response) => {
  try {
    console.log('createUser request.body =', request.body); // <-- importante para depurar

    const { newName, newEmail, newPasswd } = request.body || {};

    if (!newName || !newEmail || !newPasswd) {
      return response.status(400).json({ message: 'Faltan campos: newName, newEmail o newPasswd' });
    }

    // Asegurar que newPasswd es string antes de hashear
    const hashedPasswd = await bcrypt.hash(String(newPasswd), 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, passwd) VALUES ($1, $2, $3) RETURNING *',
      [newName, newEmail, hashedPasswd]
    );

    return response.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('createUser error:', err);
    return response.status(500).json({ message: 'Error al crear usuario' });
  }
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  pool
};