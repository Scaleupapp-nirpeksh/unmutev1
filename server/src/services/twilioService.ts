import twilio from "twilio";
const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

export function sendOTP(phone: string) {
  return client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID!)
    .verifications.create({ to: `+91${phone}`, channel: "sms" });
}

export function checkOTP(phone: string, code: string) {
  return client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID!)
    .verificationChecks.create({ to: `+91${phone}`, code })
    .then((v) => v.status === "approved");
}