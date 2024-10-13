import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';
import { Request, Response } from 'express';
const router = express.Router();

// User registration
router.post('/register', async (req:Request, res:Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' + result });
    // eslint-disable-next-line
  } catch (error:any) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login
// eslint-disable-next-line
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 * 56 // 56 hours
    });

    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ success: true, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});


// eslint-disable-next-line
router.get('/check-auth', async (req: any, res: any) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    
    // Fetch user information from the database
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.json({ authenticated: false });
    }

    const user = rows[0];

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ authenticated: false });
  }
});

//  logout route
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});


export default router;