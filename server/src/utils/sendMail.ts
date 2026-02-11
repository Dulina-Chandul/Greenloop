import resend from "../config/resend";
import { EMAIL_SENDER, NODE_ENV } from "../constants/env";

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const getFromEmail = () =>
  NODE_ENV === "development" ? "onboarding@resend.dev" : EMAIL_SENDER;

const getToEmail = (to: string) =>
  NODE_ENV === "development" ? "delivered@resend.dev" : to;

export const sendMail = async ({ to, subject, text, html }: Params) => {
  // Mock email sending as per user request (no Resend API usage)
  console.log(`[MOCK EMAIL] To: ${to}`);
  console.log(`[MOCK EMAIL] Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Body: ${text || html}`);

  return {
    data: { id: "mock-email-id" },
    error: null as any,
  };

  /*
  return await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    text,
    html,
  });
  */
};
