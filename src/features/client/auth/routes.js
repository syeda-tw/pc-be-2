import express from "express";
import registerStep1Handler from "./handlers/registerStep1Handler.js";
import { validateRegisterStep1Middleware } from "./middlewares.js";

const router = express.Router();

router.post("/register-step-1", validateRegisterStep1Middleware, registerStep1Handler);

export default router;
