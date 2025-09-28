import { Express } from "express";
const authRoutes = require('./auth.route');

export const clientRouter = (app: Express) => {
  const version = '/api/v1';
  const uri = version + '/client'

  app.use(uri + '/auth', authRoutes);
}