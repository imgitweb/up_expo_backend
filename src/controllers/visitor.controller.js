const Visitor = require("../models/visitor.model");
const { sendEmail } = require("../services/nodemailer.service");
const { generateVisitorPass } = require("../utils/passGenerator"); 

// Helper to sanitize inputs
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

// ==========================================
// 1. REGISTER VISITOR CONTROLLER
// ==========================================
const registerVisitor = async (req, res) => {
  try {
    const { name, email, phone, city, profession, purpose } = req.body;

    // --- Validation ---
    // Email aur Purpose ko required list se hata diya gaya hai
    if (
      !name?.trim() ||
      !phone?.trim() ||
      !city?.trim() ||
      !profession?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, Phone, City and Profession are required",
      });
    }

    // --- Duplicate Check (Only if Email is provided) ---
    if (email && email.trim() !== "") {
      const exists = await Visitor.findOne({ email: email.trim() });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    const currentCount = await Visitor.countDocuments();
    const nextNumber = currentCount + 1;

    // --- Generate Visitor ID ---
    const generatedVisitorId = "BVS-" + String(nextNumber).padStart(5, "0");

    // --- Create Visitor in DB ---
    const visitor = await Visitor.create({
      name: name.trim(),
      email: email?.trim() || null, // Optional email
      phone: phone.trim(),
      city: city.trim(),
      profession: profession.trim(),
      purpose: purpose?.trim() || "", // Optional purpose
      visitorId: generatedVisitorId 
    });

    // --- Generate PDF Pass ---
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateVisitorPass(visitor, 'pdf');
    } catch (err) {
        console.error("PDF Generation Failed for Email:", err);
    }

    // --- Send Email to ORGANIZER (Styling unchanged) ---
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
                    <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHTML(name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">${email ? escapeHTML(email) : "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Phone</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHTML(phone)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>City</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHTML(city)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee;"><strong>Profession</strong></td>
                    <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHTML(profession)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px;"><strong>Purpose</strong></td>
                    <td style="padding:8px;">${purpose ? escapeHTML(purpose) : "N/A"}</td>
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

    // --- Send Email to VISITOR (ONLY IF EMAIL PROVIDED - Styling unchanged) ---
    if (email && email.trim() !== "") {
        try {
          await sendEmail({
            to: email.trim(),
            subject: "Visitor Registration Confirmed – Bundelkhand Venture Summit 2026",
            replyTo: "support@bundelkhandventuresummit.com",
            attachments: pdfBuffer ? [
                {
                    filename: `VisitorPass_${name.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ] : [],
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <p>Dear ${escapeHTML(name)},</p>

                <p>
                  Thank you for registering as a <strong>Visitor</strong> for
                  <strong>Bundelkhand Venture Summit (BVS) 2026 – Startup Expo</strong>.
                </p>
                
                <p style="color: #555; font-size: 14px; font-style: italic;">
                   📎 <strong>Note:</strong> Your official Visitor Pass is attached to this email.
                </p>

                <p>
                  📅 <b>Date:</b> 28 February – 1 March 2026<br/>
                  📍 <b>Location:</b> Urban Haat, Behind Deen Dayal Sabhagar, Jhansi, Uttar Pradesh, India

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
    }

    // ✅ Return Response
    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully",
      visitorId: visitor.visitorId,
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

// ==========================================
// 2. DOWNLOAD PASS CONTROLLER
// ==========================================
const downloadVisitorPass = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findOne({ visitorId: id });

    if (!visitor) {
      return res.status(404).json({ success: false, message: "Visitor not found" });
    }

    const pdfBuffer = await generateVisitorPass(visitor, 'pdf');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename=Pass_${visitor.name.replace(/\s+/g, '_')}.pdf`,
      'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length'
    });
    
    return res.end(pdfBuffer);

  } catch (error) {
    console.error("Download Error:", error);
    return res.status(500).json({ success: false, message: "Error generating pass" });
  }
};

module.exports = { registerVisitor, downloadVisitorPass };