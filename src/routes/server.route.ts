import { Express } from "express";
import authRoutes from './auth.route';
import tagRoutes from './tag.route';
import todoRoutes from './todo.route'

export const clientRouter = (app: Express) => {
  const uri = "/api/v1"; 

  app.use(uri + '/auth', authRoutes);
  app.use(uri + '/tag', tagRoutes);
  app.use(uri + '/todo', todoRoutes)
}
