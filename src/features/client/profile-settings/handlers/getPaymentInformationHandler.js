import Client from "../../../../common/models/Client.js";

const messages = {
  success: {
    paymentInformationRetrieved: "Payment information retrieved successfully",
  },
  error: {
    paymentInformationRetrievalFailed: "Failed to retrieve payment information",
    clientNotFound: "Client not found",
  },
};

const getPaymentInformationService = async (Id) => {
  const client = await Client.findById(Id);
  if (!client) {
    throw {
      message: messages.error.clientNotFound,
      status: 404,
    };
  }
  return client.defaultPaymentMethod;
 
};

const getPaymentInformationHandler = async (req, res) => {
  const id = req.id;
  const paymentInformation = await getPaymentInformationService(id);
  res.status(200).json({
    message: messages.success.paymentInformationRetrieved,
    paymentInformation,
  });
};

export default getPaymentInformationHandler;