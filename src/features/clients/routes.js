import express from "express";
import { getAllClients } from "./controllers.js";
import { secureRequestMiddleware } from "../../common/middlewares/secureRequestMiddleware.js";

const router = express.Router();

router.get("/", secureRequestMiddleware, getAllClients);

export default router; 