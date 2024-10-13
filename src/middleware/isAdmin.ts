import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
    // eslint-disable-next-line 
  } catch (error:any) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default isAdmin;