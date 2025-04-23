import { messages } from "./messages.js";
import { getAllClientsService, createClientService, getInvitedClientsService } from "./services.js";

const getAllClients = async (req, res, next) => {
  try {
    const clients = await getAllClientsService(req.body.decodedToken._id);
    return res.status(200).json({
      clients,
      message: messages.clients.getAllSuccess
    });
  } catch (err) {
    next(err);
  }
};

const createClient = async (req, res, next) => {
  try {
    const client = await createClientService(req.body.data, req.body.decodedToken._id);
    return res.status(201).json({
      client,
      message: messages.clients.createSuccess
    });
  } catch (err) {
    next(err);
  }
};

const getInvitedClients = async (req, res, next) => {
  try {
    const clients = await getInvitedClientsService(req.body.decodedToken._id);
    return res.status(200).json({
      clients,
      message: messages.clients.getInvitedSuccess
    });
  } catch (err) {
    next(err);
  }
};

export { getAllClients, createClient, getInvitedClients }; 