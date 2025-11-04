require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const clientId = process.env.EMAIL_CLIENT_ID;
const clientSecret = process.env.EMAIL_CLIENT_SECRET;
const tenantId = process.env.EMAIL_TENANT_ID;
const userEmail = process.env.EMAIL_USER;

app.use(express.json());
app.use(cors());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Hello from Microsoft Graph Email Service!");
});

// Ruta para enviar correo
app.post("/", async (req, res) => {
  const { name, email, phone, zipcode } = req.body;
  try {
    await sendEmail(name, email, phone, zipcode);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in POST /:", error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Función para obtener token OAuth2 con client_credentials
const refreshAccessToken = async () => {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "client_credentials");
  params.append("scope", "https://graph.microsoft.com/.default");

  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error.response?.data || error.message);
    throw new Error("Error getting access token from Microsoft");
  }
};

// Función para enviar correo usando Microsoft Graph API
const sendEmail = async (name, email, phone, zipcode) => {
  const accessToken = await refreshAccessToken();

  const mailData = {
    message: {
      subject: "Leads from Quote System",
      body: {
        contentType: "HTML",
        content: `
          <h1>Solicitud Franquicia 89</h1>
          <table>
            <tr><td><strong>Nombre:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Código Postal:</strong></td><td>${zipcode}</td></tr>
          </table>
        `
      },
      toRecipients: [
        {
          emailAddress: {
            address: "alvin@sebandainsurance.com"
          }
        }
      ]
    }
  };

  try {
    const response = await axios.post(
      `https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`,
      mailData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Email sent successfully:", response.status);
  } catch (error) {
    console.error("Error sending email via Graph API:", error.response?.data || error.message);
    throw new Error("Error sending email");
  }
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
