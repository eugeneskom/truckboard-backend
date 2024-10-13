// src/models/user.ts
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin" | "agent" | "user" | "carrier" | "driver" | "broker";
  created_at: Date;
  updated_at: Date;
}
