import app from "@/server.js";
import dotenv from 'dotenv';
import { connectDB } from "@/config/db.js";
import express from "express";
dotenv.config();

connectDB();
app.use(express.json());


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});