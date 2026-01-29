const Contact = require("../models/contact.model");
const { sendEmail } = require("../services/nodemailer.service");

const escapeHTML = (str = "") =>
  str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[m]);

const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    /* ================= ORGANIZER EMAIL (IMPROVED UI) ================= */
    try {
      await sendEmail({
        to: process.env.ORGANIZER_EMAIL || "startupexpo2026@gmail.com",
        subject: "📩 New Contact Enquiry – BVS 2026",
        html: `
          <div style="background:#f4f6f8;padding:20px;font-family:Arial, sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
              
              <div style="background:#0f172a;color:#ffffff;padding:16px;">
                <h2 style="margin:0;">Bundelkhand Venture Summit 2026</h2>
                <p style="margin:4px 0 0;font-size:14px;">
                  New Contact Enquiry Received
                </p>
              </div>

              <div style="padding:20px;">
                <p style="font-size:15px;">
                  A new enquiry has been submitted via the <strong>BVS 2026 website</strong>.
                </p>

                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">
                      ${escapeHTML(name)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">
                      ${escapeHTML(email)}
                    </td>
                  </tr>
                </table>

                <div style="margin-top:16px;">
                  <p style="margin-bottom:6px;"><strong>Message</strong></p>
                  <div style="background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">
                    ${escapeHTML(message)}
                  </div>
                </div>

                <p style="margin-top:20px;font-size:13px;color:#555;">
                  📍 Jhansi, Bundelkhand<br/>
                  📅 28 February – 1 March 2026
                </p>
              </div>

              <div style="background:#f1f5f9;padding:12px;text-align:center;font-size:12px;color:#555;">
                © 2026 Bundelkhand Venture Summit | Startup Expo
              </div>

            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Organizer contact email failed:", err);
    }

    /* ================= USER CONFIRMATION EMAIL (UNCHANGED) ================= */
    try {
      await sendEmail({
        to: email,
        subject: "We’ve received your message – BVS 2026",
        replyTo: "support@bundelkhandventuresummit.com",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <p>Dear ${escapeHTML(name)},</p>

            <p>
              Thank you for contacting
              <strong>Bundelkhand Venture Summit (BVS) 2026 – Startup Expo</strong>.
            </p>

            <p>
              We’ve successfully received your message.
              Our team will review your enquiry and get back to you shortly.
            </p>

            <p>
              📅 <b>Date:</b> 28 February – 1 March 2026<br/>
              📍 <b>Location:</b> Jhansi, Bundelkhand
            </p>

            <p>
              <strong>Get in Touch</strong><br />
              <a href="https://www.instagram.com/bundelkhandventuresummit">Instagram</a>
              &nbsp;|&nbsp;
              <a href="https://www.linkedin.com/company/bundelkhandexpo/about/">LinkedIn</a>
            </p>

            <p>
              Regards,<br/>
              <strong>Bundelkhand Venture Summit Team</strong><br/>
              BVS 2026 – Startup Expo
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("User contact confirmation email failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Contact enquiry submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("CONTACT CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { submitContact };
