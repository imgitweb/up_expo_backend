const Visitor = require("../models/visitor.model");
const { sendEmail } = require("../services/nodemailer.service");

const escapeHTML = (str = "") =>
  str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[m],
  );

const registerVisitor = async (req, res) => {
  try {
    const { name, email, phone, city, profession, purpose } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !profession?.trim() ||
      !purpose?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const exists = await Visitor.findOne({ email: email.trim() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const visitor = await Visitor.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      profession: profession.trim(),
      purpose: purpose.trim(),
    });

    try {
      await sendEmail({
        to: process.env.ORGANIZER_EMAIL || "startupexpo2026@gmail.com",
        subject: "🎉 New Visitor Registration – BVS 2026",
        html: `
          <div style="background:#f4f6f8;padding:20px;font-family:Arial, sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
              
              <div style="background:#0f172a;color:#ffffff;padding:16px;">
                <h2 style="margin:0;">Bundelkhand Venture Summit 2026</h2>
                <p style="margin:4px 0 0;font-size:14px;">
                  New Visitor Registration Received
                </p>
              </div>

              <div style="padding:20px;">
                <p style="font-size:15px;">
                  A new visitor has registered for <strong>BVS 2026 – Startup Expo</strong>.
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
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">
                      ${escapeHTML(phone)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>City</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">
                      ${escapeHTML(city)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Profession</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">
                      ${escapeHTML(profession)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px;"><strong>Purpose</strong></td>
                    <td style="padding:8px;">
                      ${escapeHTML(purpose)}
                    </td>
                  </tr>
                </table>

                <p style="margin-top:20px;font-size:13px;color:#555;">
                  📍 Event Location: Jhansi, Bundelkhand<br/>
                  📅 Dates: 28 Feb – 1 Mar 2026
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
      console.error("Organizer email failed:", err);
    }

    try {
      await sendEmail({
        to: email,
        subject:
          "Visitor Registration Confirmed – Bundelkhand Venture Summit 2026",
        replyTo: "support@bundelkhandventuresummit.com",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <p>Dear ${escapeHTML(name)},</p>

            <p>
              Thank you for registering as a <strong>Visitor</strong> for
              <strong>Bundelkhand Venture Summit (BVS) 2026 – Startup Expo</strong>.
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
              <strong>Bundelkhand Venture Summit Team</strong>
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Visitor email failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      data: visitor,
    });
  } catch (error) {
    console.error("VISITOR CONTROLLER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { registerVisitor };
