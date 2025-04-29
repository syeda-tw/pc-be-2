import express from "express";
import {
  validateRegisterMiddleware
} from "./middlewares.js";
import  registerHandler  from "./handlers/registerHandler.js";

const router = express.Router();
router.post("/register", validateRegisterMiddleware, registerHandler);
export default router;
