import nodemailer from "nodemailer";

// // ============================================
// // Validate required environment variables
// // ============================================

// const requiredEnvVars = [
//   "GOOGLE_USER_EMAIL",
//   "GOOGLE_CLIENT_ID",
//   "GOOGLE_CLIENT_SECRET",
//   "GOOGLE_REFRESH_TOKEN",
// ];

// const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

// if (missingVars.length > 0) {
//   console.error(
//     `❌ Missing email env vars: ${missingVars.join(", ")}. Email service will NOT work.`,
//   );
// }

// ============================================
// Create Nodemailer transporter (Gmail OAuth2)
// ============================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: parseInt(process.env.BREVO_SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    // type: "OAuth2",
    user: process.env.GOOGLE_USER_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
    // clientId: process.env.GOOGLE_CLIENT_ID,
    // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email server verification failed:");
    console.error("   Error name:", error.name);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);

    if (error.code === "ENETUNREACH") {
      console.error(
        "   💡 Hint: This is an IPv6 issue. Ensure dns.setDefaultResultOrder('ipv4first') is called in server.js BEFORE any imports.",
      );
    }
    if (error.code === "EAUTH") {
      console.error(
        "   💡 Hint: OAuth2 credentials may be invalid or expired. Regenerate your GOOGLE_REFRESH_TOKEN.",
      );
    }
  } else {
    console.log("📧 Email server is ready to send messages");
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ModelVerse AI Team" <${process.env.GOOGLE_USER_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, //plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

/*
// mail.service.js
import nodemailer from "nodemailer";
import { Resend } from "resend";

const isProduction = process.env.NODE_ENV === "production";

// ============================================
// Production: Resend (HTTP-based, works on Render)
// Development: Gmail OAuth2 (SMTP)
// ============================================

let resend;
let transporter;

if (isProduction) {
  // ---- PRODUCTION: Resend ----
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("📧 Email service: Resend (production)");
} else {
  // ---- DEVELOPMENT: Gmail OAuth2 ----
  const requiredEnvVars = [
    "GOOGLE_USER_EMAIL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    console.error(`❌ Missing email env vars: ${missingVars.join(", ")}. Email service will NOT work.`);
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER_EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email server verification failed:");
      console.error("   Error name:", error.name);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      if (error.code === "ENETUNREACH") {
        console.error("   💡 Hint: IPv6 issue. Call dns.setDefaultResultOrder('ipv4first') before imports in server.js");
      }
      if (error.code === "EAUTH") {
        console.error("   💡 Hint: OAuth2 credentials invalid or expired. Regenerate GOOGLE_REFRESH_TOKEN.");
      }
    } else {
      console.log("📧 Email server is ready to send messages (Gmail OAuth2)");
    }
  });
}

// ============================================
// Unified sendEmail function
// ============================================
export const sendEmail = async (to, subject, text, html) => {
  try {
    if (isProduction) {
      // Resend
      const { data, error } = await resend.emails.send({
        from: "ModelVerse AI Team <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
      });

      if (error) {
        console.error("❌ Email error:", error);
        return false;
      }

      console.log("✅ Message sent:", data.id);
      return true;
    } else {
      // Gmail OAuth2
      const info = await transporter.sendMail({
        from: `"ModelVerse AI Team" <${process.env.GOOGLE_USER_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });

      console.log("✅ Message sent:", info.messageId);
      return true;
    }
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    return false;
  }
};
*/

// mail.service.js
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async (to, subject, text, html) => {
//   try {
//     console.log("Attempting to send email to:", to);
//     console.log("Subject:", subject);
//     console.log("Resend Key Loaded:", !!process.env.RESEND_API_KEY);

//     const { data, error } = await resend.emails.send({
//       from: "ModelVerse <onboarding@resend.dev>", // free sandbox domain, works instantly
//       // from: `"ModelVerse AI Team" <${process.env.GOOGLE_USER_EMAIL}>`, // sender address
//       to,
//       subject,
//       html,
//       text,
//     });

//     if (error) {
//       console.error("❌ Email error:", error);
//       return false;
//     }

//     console.log("✅ Email sent:", data.id);
//     return true;
//   } catch (err) {
//     console.error("❌ Email failed:", err.message);
//     return false;
//   }
// };
