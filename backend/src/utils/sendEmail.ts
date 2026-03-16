import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525"),
    auth: {
      user: process.env.SMTP_EMAIL || "test_user",
      pass: process.env.SMTP_PASSWORD || "test_password",
    },
  });

  // Just for local development: if we don't have real credentials,
  // we'll just log the email to the console so the user can test the link
  if (!process.env.SMTP_HOST) {
    console.log("---------------------------------------------------------");
    console.log("DEV MODE: Email intercepted (No SMTP credentials found)");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log("---------------------------------------------------------");
    return;
  }

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME || "Urban Elegance"} <${process.env.FROM_EMAIL || "noreply@urbanelegance.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(message);
};

export default sendEmail;
