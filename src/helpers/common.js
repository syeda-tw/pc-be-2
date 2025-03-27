import { format } from "date-fns";
import nodemailer from "nodemailer";
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
