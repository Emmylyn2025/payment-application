import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { generate4DigitOtp } from "../utils/otp";
import { saveLoginOtpToRedis } from "../utils/otp";

const resend = new Resend(process.env.resend_api_key!);


export async function sendEmailVerfication(to: string, url: string) {
  
  const html = fs.readFileSync("src/emails/emailVerificationTemplate.html", "utf-8");
  const customizedHtml = html.replace(/https:\/\/yourapp\.com\/verify\?token=abc123xyz/g, url);

  try {

    const { error, data } = await resend.emails.send({
      from: process.env.resend_from!,
      to,
      subject: "verify your email",
      html: customizedHtml
    });

    if (error) {
      console.log(`Error when sending email verification to ${to}.`)
      console.log(`Error message: ${error}`);
    } else {
      console.log(`Email verification sent successfully to ${to}`, data);
    }
    
  } catch (error) {
    console.log("Error trying to send verification email", error);
    new Error("Email Verification error");
  }
}