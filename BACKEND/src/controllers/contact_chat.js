import { ApiResponse, asyncHandler } from "../utils/helpers.js";
import logger from "../utils/logger.js";

export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  logger.info(`📬 Contact form — from: ${name} <${email}> | subject: ${subject}`);

  // TODO: plug in nodemailer here when SMTP creds are ready
  // await emailService.sendContactEmail({ name, email, subject, message });

  res.status(200).json(
    new ApiResponse(200, {}, "Message received! We'll reply within 24 hours. 🙏")
  );
});