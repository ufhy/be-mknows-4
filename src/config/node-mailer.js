import { createTransport } from "nodemailer";
import { apiResponse } from "@utils/apiResponse";
import {
  GOOGLE_EMAIL, GOOGLE_APP_PASSWORD,
} from "@config/index";

export const sendEmail = async (to, subject, templates) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: GOOGLE_EMAIL,
        pass: GOOGLE_APP_PASSWORD,
      },
      // host: "smtp.gmail.com",
      // port: 587,
      // secure: false, // true for 465, false for other ports
    });

    const mailOptions = {
      from: "Bootcamp <no-reply@m-knowsconsulting.com>",
      replyTo: "no-reply@m-knowsconsulting.com",
      to,
      subject: `Bootcamp - ${subject}`,
      html: templates,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(`Error Transporter: ${err.message}`);
        return apiResponse(400, "INTERNAL SERVER ERROR", err.message);
      }

      console.info(`Successfully sent email to ${to} with subject - ${mailOptions.subject}`);
      console.info(`Email sent: ${info.response}`);
    });
  } catch (error) {
    throw apiResponse(status.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", error.message);
  }
};