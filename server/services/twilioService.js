const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS alert
const sendEmergencyAlert = async ({ to, userName, lat, lng }) => {
  try {
    const locationLink = `https://maps.google.com/?q=${lat},${lng}`;
    await client.messages.create({
      body: `🚨 EMERGENCY ALERT: ${userName} has triggered an SOS. Their live location: ${locationLink} — Please respond immediately.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`Emergency SMS sent to ${to}`);
  } catch (err) {
    console.error("Twilio SMS failed:", err.message);
  }
};

// Send voice call alert
const sendEmergencyCall = async ({ to, userName }) => {
  try {
    await client.calls.create({
      twiml: `
        <Response>
          <Say voice="alice" loop="3">
            Emergency Alert. ${userName} has triggered an SOS and needs immediate help. 
            Please check your messages for their live location. 
            Emergency Alert. ${userName} needs help now.
          </Say>
        </Response>
      `,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`Emergency call initiated to ${to}`);
  } catch (err) {
    console.error("Twilio call failed:", err.message);
  }
};

// Send both SMS and call
const sendEmergencyNotifications = async ({ to, userName, lat, lng }) => {
  // Run both in parallel — if one fails the other still goes through
  await Promise.allSettled([
    sendEmergencyAlert({ to, userName, lat, lng }),
    sendEmergencyCall({ to, userName }),
  ]);
};

module.exports = { sendEmergencyAlert, sendEmergencyCall, sendEmergencyNotifications };