import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

console.log("Verify SID =>", process.env.TWILIO_SERVICE_SID);  // debug line
const verifyService = client.verify.v2.services(process.env.TWILIO_SERVICE_SID!);


/** Send a 6‑digit OTP to +91<phone>  */
export function sendOTP(phone: string) {
  // E.164 format: +<country_code><number>
  return verifyService.verifications.create({
    to: `+91${phone}`,
    channel: "sms"
  });
}

/** Returns true only when code matches */
export async function checkOTP(phone: string, code: string) {
  const res = await verifyService.verificationChecks.create({
    to: `+91${phone}`,
    code
  });
  return res.status === "approved";
}
