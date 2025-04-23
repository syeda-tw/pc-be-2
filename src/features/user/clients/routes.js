import express from "express";
import { getAllClients, createClient, getInvitedClients } from "./controllers.js";
import { secureRequestMiddleware } from "../../../common/middlewares/secureRequestMiddleware.js";
import { createClientValidation } from "./middleware.js";

const router = express.Router();

router.get("/", secureRequestMiddleware, getAllClients);

router.get("/invited", secureRequestMiddleware, getInvitedClients);

router.post("/",
    createClientValidation,
    secureRequestMiddleware, 
    createClient);

export default router; 