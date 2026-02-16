const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

/**
 * Helper to convert local image to Base64
 */
const imageToBase64 = (filePath) => {
  try {
    const bitmap = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${bitmap.toString("base64")}`;
  } catch (err) {
    console.error("Image loading failed:", err);
    return null;
  }
};

const generateVisitorPass = async (visitor, type = "pdf") => {
  let browser = null;
  try {
    // 1. Resources Generate Karein
    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({
        id: visitor.visitorId,
        name: visitor.name,
        email: visitor.email,
      }),
    );

    // Background Image Load
    const imagePath = path.join(__dirname, "../pass/pass1.jpeg");
    const backgroundBase64 = imageToBase64(imagePath);

    if (!backgroundBase64) {
      throw new Error("Template image not found!");
    }

    try {
      // 1️⃣ Try system Chrome
      browser = await puppeteer.launch({
        headless: "new",
        channel: "chrome",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      console.log("⚠ System Chrome not found, using bundled Chromium...");

      // 2️⃣ Fallback to Puppeteer Chromium
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    const page = await browser.newPage();

    // 3. HTML Content Set Karein
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Courier+Prime:wght@700&display=swap" rel="stylesheet">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Poppins', sans-serif;
            width: 1550px; 
            height: 520px; 
          }
          
          /* Background Container */
          .pass-container {
            position: relative;
            width: 1550px;
            height: 520px;
            background-image: url('${backgroundBase64}');
            background-size: cover;
            background-repeat: no-repeat;
          }

          /* =========================================
             1. RIGHT SIDE STUB (Target Area)
             ========================================= */
          
          /* NAME: Authorized Stamp ke theek neeche center me */
          .stub-name {
            position: absolute;
            top: 280px;        /* Authorized Box ke neeche gap */
            left: 1230px;      /* Stub start position */
            width: 380px;      /* Stub width for centering */
            text-align: center;
            font-size: 20px;   /* Thoda bada size */
            font-weight: 700;  /* Extra Bold */
            color: #000;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            z-index: 10;
          }

          /* ID: Bottom me 'Ticket Number' line ke upar */
          .stub-id {
            position: absolute;
            top: 330px;        /* Line ke theek upar */
            left: 1300px;      /* "TICKET NUMBER:" text ke baad shift kiya */
            font-family: 'Courier Prime', monospace;
            font-size: 34px;
            font-weight: 900;
            color: #424ef5;
            letter-spacing: 0.1em;
            z-index: 10;
          }

          /* =========================================
             2. QR CODE (Middle Section)
             ========================================= */
          .qr-code {
            position: absolute;
            top: 130px; 
            left: 1050px; 
            width: 110px;
            height: 110px;
            border: 2px solid #fff;
            background: #fff;
          }

        </style>
      </head>
      <body>
        
        <div class="pass-container">
            
            <img src="${qrCodeData}" class="qr-code" />

            <div class="stub-name">
              ${visitor.name}
            </div>

            <div class="stub-id">
              ${visitor.visitorId}
            </div>

        </div>

      </body>
      </html>
    `;

    // 4. Puppeteer Page Setup
    await page.setViewport({ width: 1550, height: 520, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    let buffer;
    if (type === "pdf") {
      buffer = await page.pdf({
        printBackground: true,
        width: "1550px",
        height: "520px",
        pageRanges: "1",
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    } else {
      const element = await page.$(".pass-container");
      buffer = await element.screenshot({ type: "jpeg", quality: 90 });
    }

    await browser.close();
    return buffer;
  } catch (error) {
    if (browser) await browser.close();
    console.error("Pass Generation Error:", error);
    throw error;
  }
};

module.exports = { generateVisitorPass };
