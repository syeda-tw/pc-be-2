import express from "express";
import { getAllClients, getInvitedClients } from "./controllers.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { createClientValidation } from "./middleware.js";
import { createClientHandler } from "./createClientHandler.js";

const router = express.Router();

router.get("/", secureRequestMiddleware, getAllClients);

router.get("/invited", secureRequestMiddleware, getInvitedClients);

router.post("/",
    createClientValidation,
    secureRequestMiddleware, 
    createClientHandler);

export default router; 