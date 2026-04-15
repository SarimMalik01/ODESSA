import { transporter } from "../utils/mailer.js";
import {User} from "../models/User.model.js"

export const sendFeedback = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, message, tags = [] } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: "Subject is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const user = await User.findById(userId).select("email name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tagLine =
      tags.length > 0 ? `[${tags.join(", ")}] ` : "";

    await transporter.sendMail({
      from: `"ODESSA" <${process.env.SMTP_USER}>`,
      to: process.env.FEEDBACK_RECEIVER_EMAIL,
      replyTo: user.email,
      subject: `${tagLine}${subject}`,
      html: `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #0f0f0f;
        padding: 24px;
        color: #e5e5e5;
      ">
        <div style="
          max-width: 560px;
          margin: 0 auto;
          background-color: #151515;
          border: 1px solid #262626;
          border-radius: 12px;
          padding: 24px;
        ">
    
          <!-- Header -->
          <div style="margin-bottom: 20px;">
            <h2 style="
              margin: 0;
              font-size: 20px;
              font-weight: 600;
              color: #ffffff;
            ">
              ODESSA Feedback
            </h2>
            <p style="
              margin: 6px 0 0;
              font-size: 13px;
              color: #9ca3af;
            ">
              New feedback received from a user
            </p>
          </div>
    
          <!-- Meta -->
          <div style="
            background-color: #0b0b0b;
            border: 1px solid #262626;
            border-radius: 8px;
            padding: 12px 14px;
            font-size: 13px;
            color: #d1d5db;
            margin-bottom: 18px;
          ">
            <p style="margin: 0 0 6px;">
              <strong>From:</strong> ${user.email}
            </p>
    
            ${
              tags.length
                ? `<p style="margin: 0;">
                     <strong>Tags:</strong> ${tags.join(", ")}
                   </p>`
                : ""
            }
          </div>
    
          <!-- Message -->
          <div style="
            font-size: 14px;
            line-height: 1.6;
            color: #e5e7eb;
            white-space: pre-wrap;
          ">
            ${message}
          </div>
    
          <!-- Footer -->
          <div style="
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #262626;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          ">
            Sent from ODESSA • Feedback System
          </div>
    
        </div>
      </div>
    `,    
    });

    res.status(200).json({ message: "Feedback sent successfully" });
  } catch (err) {
    console.error("❌ Feedback email failed:", err);
    res.status(500).json({ message: "Failed to send feedback" });
  }
};
