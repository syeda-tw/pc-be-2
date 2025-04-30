import express from "express";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import getUsersWhoInvitedClient from "./handlers/getUsersWhoInvitedClient.js";

const router = express.Router();

router.get("/", secureRequestMiddleware, getUsersWhoInvitedClient);

export default router;