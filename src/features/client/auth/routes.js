import express from "express";
import {
  validateRegisterMiddleware,
  validateLoginMiddleware
} from "./middlewares.js";
import registerHandler from "./handlers/registerHandler.js";
import loginHandler from "./handlers/loginHandler.js";

const router = express.Router();

router.post("/register", validateRegisterMiddleware, registerHandler);
router.post("/login", validateLoginMiddleware, loginHandler);

export default router;
