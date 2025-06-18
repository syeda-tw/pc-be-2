import User from "../../../common/models/User.js";
import Client from "../../../common/models/Client.js";
import Relationship from "../../../common/models/Relationship.js";
import InvitedClient from "../../../common/models/InvitedClient.js";
import { env } from "../../../common/config/env.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

const messages = {
  error: {
    noFile: "Please upload a CSV file",
    invalidColumns: "CSV must contain columns: firstName, lastName, emailAddress, phoneNumber",
    userNotFound: "We couldn't find your account",
    internalError: "Something went wrong. Please try again",
    emptyFile: "The uploaded CSV file is empty"
  },
  success: {
    bulkClientsProcessed: "Bulk client import completed successfully"
  }
};

const sendInvitationSMSToExistingClient = async (clientName, userName) => {
  // TODO: Implement SMS sending logic
};

const sendInvitationSMSToExistingInvitedClient = async (clientName, userName) => {
  console.log("[DEBUG] Sending SMS to existing invited client");
  console.log(
    `Hello ${clientName}, ${userName} has invited you to join their network on Practicare. Visit ${env.FRONTEND_URL}/client-registration to get started.`
  );
};

const createSingleClientService = async (data, userId, user) => {
  const { phoneNumber: phone, firstName, lastName, emailAddress: email } = data;

  try {
    const existingClient = await Client.findOne({ phone });
    if (existingClient) {
      const relationship = user.relationships.some((relationship) =>
        relationship.client.equals(existingClient._id)
      );
      if (relationship) {
        return { success: false, error: "This client is already in your network" };
      }

      await sendInvitationSMSToExistingClient(
        `${existingClient.firstName} ${existingClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      
      const newRelationship = await Relationship.create({
        client: existingClient._id,
        clientModel: "Client",
        user: userId,
        status: "pending"
      });

      user.relationships.push(newRelationship);
      existingClient.relationships.push(newRelationship);
      await existingClient.save();

      return { success: true, client: existingClient.toObject() };
    }

    const invitedClient = await InvitedClient.findOne({ phone });
    if (invitedClient) {
      const relationship = user.relationships.some((relationship) =>
        relationship.client.equals(invitedClient._id)
      );
      if (relationship) {
        return { success: false, error: "This client is already in your network" };
      }

      const newRelationship = await Relationship.create({
        client: invitedClient._id,
        user: userId,
        status: "pending",
        clientModel: "InvitedClient",
      });

      user.relationships.push(newRelationship);
      invitedClient.relationships.push(newRelationship);
      await invitedClient.save();

      await sendInvitationSMSToExistingInvitedClient(
        `${invitedClient.firstName} ${invitedClient.lastName}`,
        `${user.firstName} ${user.lastName}`
      );
      return { success: true, client: invitedClient.toObject() };
    }

    const newClient = await InvitedClient.create({
      firstName,
      lastName,
      phone,
      email: email || null,
      relationships: [],
    });

    const newRelationship = await Relationship.create({
      client: newClient._id,
      clientModel: "InvitedClient",
      user: userId,
      status: "pending",
    });

    user.relationships.push(newRelationship);
    newClient.relationships.push(newRelationship);
    await newClient.save();

    return { success: true, client: newClient.toObject() };
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return { success: false, error: "This email address is already registered" };
    } else if (error.code === 11000 && error.keyPattern?.phone) {
      return { success: false, error: "This phone number is already registered" };
    }
    return { success: false, error: "Failed to create client due to internal error" };
  }
};

const validateClientData = (client, rowIndex) => {
  const errors = [];
  
  if (!client.firstName || client.firstName.trim() === '') {
    errors.push(`Row ${rowIndex}: firstName is required`);
  }
  
  if (!client.lastName || client.lastName.trim() === '') {
    errors.push(`Row ${rowIndex}: lastName is required`);
  }
  
  if (!client.phoneNumber || client.phoneNumber.trim() === '') {
    errors.push(`Row ${rowIndex}: phoneNumber is required`);
  } else {
    // Format phone number to +1XXXXXXXXXX if it's just 10 digits
    let phone = client.phoneNumber.trim().replace(/\D/g, '');
    if (phone.length === 10) {
      client.phoneNumber = `+1${phone}`;
    } else if (phone.length === 11 && phone.startsWith('1')) {
      client.phoneNumber = `+${phone}`;
    } else if (!client.phoneNumber.match(/^\+1\d{10}$/)) {
      errors.push(`Row ${rowIndex}: phoneNumber must be a valid US phone number`);
    }
  }
  
  if (client.emailAddress && client.emailAddress.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client.emailAddress.trim())) {
      errors.push(`Row ${rowIndex}: emailAddress must be a valid email`);
    }
  }
  
  return errors;
};

const createBulkClientsService = async (csvBuffer, userId) => {
  const user = await User.findById(userId).populate("relationships");
  if (!user) {
    throw { status: 404, message: messages.error.userNotFound };
  }

  return new Promise((resolve, reject) => {
    const clients = [];
    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0
    };

    const stream = Readable.from(csvBuffer);
    
    stream
      .pipe(csvParser())
      .on('data', (data) => {
        clients.push(data);
      })
      .on('end', async () => {
        if (clients.length === 0) {
          return reject({ status: 400, message: messages.error.emptyFile });
        }

        // Validate columns exist
        const firstRow = clients[0];
        const requiredColumns = ['firstName', 'lastName', 'emailAddress', 'phoneNumber'];
        const hasAllColumns = requiredColumns.every(col => col in firstRow);
        
        if (!hasAllColumns) {
          return reject({ status: 400, message: messages.error.invalidColumns });
        }

        // Process each client
        for (let i = 0; i < clients.length; i++) {
          const client = clients[i];
          const rowIndex = i + 2; // +2 because CSV starts at row 1 and we skip header
          
          // Validate client data
          const validationErrors = validateClientData(client, rowIndex);
          if (validationErrors.length > 0) {
            results.failed.push({
              row: rowIndex,
              data: client,
              errors: validationErrors
            });
            results.totalProcessed++;
            continue;
          }

          // Try to create the client
          try {
            const result = await createSingleClientService(client, userId, user);
            if (result.success) {
              results.successful.push({
                row: rowIndex,
                client: {
                  _id: result.client._id,
                  firstName: result.client.firstName,
                  lastName: result.client.lastName,
                  phone: result.client.phone,
                  email: result.client.email
                }
              });
            } else {
              results.failed.push({
                row: rowIndex,
                data: client,
                errors: [result.error]
              });
            }
          } catch (error) {
            results.failed.push({
              row: rowIndex,
              data: client,
              errors: ["Unexpected error occurred while creating client"]
            });
          }
          
          results.totalProcessed++;
        }

        // Save user with updated relationships
        await user.save();
        
        resolve(results);
      })
      .on('error', (error) => {
        reject({ status: 400, message: "Invalid CSV file format" });
      });
  });
};

const createBulkClientsHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: messages.error.noFile });
    }

    const results = await createBulkClientsService(req.file.buffer, req.id);
    
    res.status(200).json({
      message: messages.success.bulkClientsProcessed,
      results: {
        totalProcessed: results.totalProcessed,
        successful: results.successful.length,
        failed: results.failed.length,
        successfulClients: results.successful,
        failedClients: results.failed
      }
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export default createBulkClientsHandler;
