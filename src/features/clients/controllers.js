import { messages } from "./messages.js";
import { getAllClientsService } from "./services.js";

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

export { getAllClients }; 