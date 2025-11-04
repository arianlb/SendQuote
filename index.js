require("dotenv").config();
const express = require("express");
const cors = require('cors');
const axios = require("axios");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;
const clientId = process.env.EMAIL_CLIENT_ID;
const clientSecret = process.env.EMAIL_CLIENT_SECRET;
const tenantId = process.env.EMAIL_TENANT_ID;
const userEmail = process.env.EMAIL_USER;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  const { name, email, phone, zipcode } = req.body;
  sendEmail(name, email, phone, zipcode);
  res.status(200).json({ message: "Email sent successfully" });
});

const sendEmail = async (name, email, phone, zipcode) => {
  const accessToken = await refreshAccessToken();
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      type: "OAuth2",
      user: userEmail,
      clientId: clientId,
      clientSecret: clientSecret,
      accessToken,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "alvin@sebandainsurance.com",
    subject: "Leads from Quote System",
    html: `
                    <h1>Solicitud Franquicia 89</h1>
                    <table>
                      <tr><td><strong>Nombre:</strong></td><td>${name}</td></tr>
                      <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                        <tr><td><strong>Teléfono:</strong></td><td>${phone}</td></tr>
                        <tr><td><strong>Código Postal:</strong></td><td>${zipcode}</td></tr>
                    </table>
                    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};

const refreshAccessToken = async () => {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "password");
  params.append("scope", "https://outlook.office365.com/.default");
  params.append("username", userEmail);
  params.append("password", "Sebanda#89.it");
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
    throw new Error("Error getting access token from email");
  }
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
