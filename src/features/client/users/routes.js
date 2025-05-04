import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getUsersHandler from "./handlers/getUsersHandler.js";

const router = express.Router();

router.get("/", secureRequestMiddleware, getUsersHandler);

export default router;