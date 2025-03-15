import { format } from "date-fns";
import nodemailer from "nodemailer";

export const sendErrorResponse = ({ status, message, res }) => {
  if (res && typeof res.status === "function") {
    return res.status(status).json({ message });
  } else {
    console.error("Invalid response object passed to sendErrorResponse");
    throw new Error("Invalid response object");
  }
};

export const formatDate = (date) => {
  return format(date, "yyyy-MM-dd HH:mm:ss");
};
//THIS IS CREATED SO THAT TEST ACCOUNTS CAN BE CREATED WITH THE SAME EMAIL ADDRESS
const getEmailForDevelopment = (email) => {
  if (process.env.ENV === "development" && email.includes("+")) {
    // Split by '+' and get the part before '@'
    const beforeAt = email.split("+")[0];
    const domain = email.split("@")[1];
    return `${beforeAt}@${domain}`; // Reconstruct the email without the part between '+' and '@'
  }
  return email; // Return the email as is if not in development or no '+' found
};

/**
 * Send email using Gmail SMTP with Nodemailer
 * @param to - Recipient email address
 * @param subject - Subject of the email
 * @param text - Body of the email
 * @param html - HTML body of the email (optional)
 * @returns Promise indicating the email status
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: getEmailForDevelopment(to) || to,
      subject,
      text,
      html: html || text,
    };
    console.log("Sending email to:", mailOptions.to); // Log the recipient for debugging

    // Send mail using the defined transporter
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error("Failed to send email");
  }
};

/**
 * Generate an HTML email body with dynamic content
 * @param {string} heading - The dynamic heading for the email
 * @param {string} body - The dynamic body content for the email
 * @returns {string} - The HTML email content with dynamic data injected
 */
export const generateEmailHtml = (heading, body) => {
  let htmlTemplate = `
       <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Template</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: transparent;
            color: #333333; /* Black grey for text */
          }
          .email-container {
            width: 100%;
            background-color: transparent;
            padding: 20px;
            text-align: center;
          }
          .email-header {
            padding: 10px;
            margin-bottom: 20px;
          }
          .email-logo {
            width: 150px;
          }
          .email-body {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 30px;
          }
          .email-footer {
            font-size: 12px;
            color: #777777; /* Grey for footer text */
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
          }
          .email-footer a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="{{logoUrl}}" alt="App Logo" class="email-logo" />
          </div>
          <div class="email-body">
            <h1>{{heading}}</h1>
            <p>{{body}}</p>
          </div>
          <div class="email-footer">
            <p>&copy; 2025 Practicare. All rights reserved. <br />
              <a href="https://www.practicare.co/privacy">Privacy Policy</a> | 
              <a href="https://www.practicare.co/unsubscribe">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Replace placeholders with dynamic content
  htmlTemplate = htmlTemplate.replace("{{heading}}", heading);
  htmlTemplate = htmlTemplate.replace("{{body}}", body);
  return htmlTemplate;
};
