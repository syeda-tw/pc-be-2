import Client from '../../../../common/models/Client.js';
import Relationship from "../../../../common/models/Relationship.js";

const messages = {
  success: "Here are your relationship details!",
  error: {
    noRelationships: "You don't have any relationships yet. Please connect with someone first.",
    notFound: "We couldn't find the relationship details you're looking for."
  }
};

const getDefaultRelationshipDetailsService = async (id) => {
 const client = await Client.findById(id);
 if(!client){
  throw {
    status: 404,
    message: messages.error.notFound,
  };
 }
 if(!client.defaultRelationship){
  if(client.relationships.length === 0){
    throw {
      status: 404,
      message: messages.error.noRelationships,
    };
  }
  client.defaultRelationship = client.relationships[0];
  await client.save();
 }
const relationship = await Relationship.findById(client.defaultRelationship).populate("user");
return {
  firstName: relationship.user.firstName,
  lastName: relationship.user.lastName,
  middleName: relationship.user.middleName,
  email: relationship.user.email,
  phone: relationship.user.phone,
  relationshipId: relationship._id,
}
};

const getDefaultRelationshipDetails = async (req, res) => {
  try {
    const id = req.id;
    const userDetails = await getDefaultRelationshipDetailsService(id);
    res.status(200).json({
      message: messages.success,
      userDetails,
    });
  } catch (error) {
    next(error);
  }
};

export default getDefaultRelationshipDetails;
