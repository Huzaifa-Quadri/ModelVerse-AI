import { sendEmail } from "../services/mail.service.js";

export const sendVerificationEmail = async ({
  email,
  name,
  verificationLink,
}) => {
  const subject = "Verify Your Account - ModelVerse AI";

  const text = `Hi ${name}, please verify your account: ${verificationLink}`;

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table align="center" width="600" style="background: #ffffff; border-radius: 10px; padding: 20px;">
      
      <tr>
        <td style="text-align: center;">
          <h2 style="color: #333;">Welcome to ModelVerse AI 🚀</h2>
        </td>
      </tr>

      <tr>
        <td>
          <p style="font-size: 16px; color: #555;">
            Hi <strong>${name}</strong>,
          </p>

          <p style="font-size: 16px; color: #555;">
            We're excited to have you on board! Please verify your email by clicking below.
          </p>
        </td>
      </tr>

      <tr>
        <td style="text-align: center; padding: 20px;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
             Verify Account
          </a>
        </td>
      </tr>

      <tr>
        <td>
          <p style="font-size: 14px; color: #777;">
            Or copy this link:
          </p>

          <p style="word-break: break-all; font-size: 14px;">
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
        </td>
      </tr>

      <tr>
        <td>
          <p style="font-size: 14px; color: #777;">
            If you didn’t create this account, ignore this email.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding-top: 20px;">
          <p style="font-size: 14px; color: #555;">
            Regards,<br/>
            <strong>ModelVerse AI Team</strong>
          </p>
        </td>
      </tr>

    </table>
  </div>
  `;

  return await sendEmail(email, subject, text, html);
};

export const accountVerified = (res) => {
  const html = `
  
  `;
  res.sendHTML(html);
};
