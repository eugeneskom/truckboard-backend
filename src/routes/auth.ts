import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';
const router = express.Router();

// User registration
router.post('/register', async (req:any, res:any) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' + result });
  } catch (error:any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login

router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h'
    });

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });

    // Send user information (excluding sensitive data like password)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.json({ success: true, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});


// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/check-auth', (req: any, res: any) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    // Here you would typically fetch the user from the database
    // For this example, we'll just send back the userId
    res.json({ authenticated: true, user: { id: decoded.userId } });
  } catch {
    res.json({ authenticated: false });
  }
});


export default router;