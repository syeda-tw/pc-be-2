import express from "express";
import {
  validateRegisterMiddleware
} from "./middlewares.js";

const router = express.Router();
router.post("/register", validateRegisterMiddleware, register);
export default router;
