import ejs from "ejs";
import path from "path";
import { sendEmail } from "@config/node-mailer";

export const sendEmailOTP = async (data): Promise<void> => {
  const template = await ejs.renderFile(
    path.join(__dirname, "../../public/templates/email-verification.ejs"),
    { data },
  );

  await sendEmail(data.email, "Email Verification", template);
};

export const sendPayment = async (data): Promise<void> => {
  const template = await ejs.renderFile(
    path.join(__dirname, "../../public/templates/email-verification.ejs"),
    { data },
  );

  await sendEmail(data.email, "Email Verification", template);
};

export const sendForgetPassword = async (data): Promise<void> => {
  const template = await ejs.renderFile(
    path.join(__dirname, "../../public/templates/email-verification.ejs"),
    { data },
  );

  await sendEmail(data.email, "Email Verification", template);
};