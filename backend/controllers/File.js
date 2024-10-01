const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const mailer = require("nodemailer");
const ReserveModel = require("../models/ReserveModel");
const UserModel = require("../models/UserModel");
const cron = require('node-cron');

const transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_SENDER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
};

const formatDuration = (startTime, endTime) => {
  const start = new Date(startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(endTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} to ${end}`;
};

const getCurrentMonthName = () => {
  const options = { month: "long" };
  return new Date().toLocaleDateString(undefined, options);
};

const generatePDFContent = (doc, reservations, title) => {
  doc.fontSize(18).text("GDS Monthly Reservation", { align: "center" });
  doc.fontSize(20).text(title, { align: "center" });
  doc.moveDown(2); 

  const headerY = 150;
  const rowHeight = 35;
  const colXPositions = {
    date: 25,
    room: 100,
    bookedBy: 180,
    title: 255,
    duration: 370,
    members: 470,
  };

  doc
    .fontSize(10)
    .text("Date", colXPositions.date, headerY, { width: 70, align: "center" })
    .text("Room", colXPositions.room, headerY, { width: 75, align: "center" })
    .text("Booked By", colXPositions.bookedBy, headerY, {
      width: 75,
      align: "center",
    })
    .text("Title", colXPositions.title, headerY, {
      width: 110,
      align: "center",
    })
    .text("Duration", colXPositions.duration, headerY, {
      width: 100,
      align: "center",
    })
    .text("Members", colXPositions.members, headerY, {
      width: 100,
      align: "center",
    });

  doc
    .lineWidth(1)
    .moveTo(20, headerY + rowHeight - 15)
    .lineTo(580, headerY + rowHeight - 15)
    .stroke();

  let yPosition = headerY + rowHeight;
  reservations.forEach((reservation) => {
    const membersArray = [...reservation.attendees, reservation.guest].filter(
      Boolean
    );
    const membersText = membersArray.length > 0 ? membersArray.join(", ") : "";
    const membersTextHeight = doc.heightOfString(membersText, { width: 100 });
    const rowHeight = Math.max(35, membersTextHeight + 15);

    if (yPosition + rowHeight > doc.page.height - 100) {
      doc.addPage();
      yPosition = 100;

      doc
        .fontSize(10)
        .text("Date", colXPositions.date, yPosition, {
          width: 75,
          align: "center",
        })
        .text("Room", colXPositions.room, yPosition, {
          width: 70,
          align: "center",
        })
        .text("Booked By", colXPositions.bookedBy, yPosition, {
          width: 70,
          align: "center",
        })
        .text("Title", colXPositions.title, yPosition, {
          width: 110,
          align: "center",
        })
        .text("Duration", colXPositions.duration, yPosition, {
          width: 110,
          align: "center",
        })
        .text("Members", colXPositions.members, yPosition, {
          width: 100,
          align: "center",
        });

      doc
        .lineWidth(1)
        .moveTo(20, yPosition + rowHeight - 15)
        .lineTo(580, yPosition + rowHeight - 15)
        .stroke();

      yPosition += rowHeight;
    }

    const padding = 5;

    doc
      .fontSize(8)
      .text(
        formatDate(reservation.scheduleDate),
        colXPositions.date + padding,
        yPosition,
        { width: 75 - padding, align: "left" }
      )
      .text(reservation.roomName, colXPositions.room + padding, yPosition, {
        width: 70 - padding,
        align: "left",
      })
      .text(
        `${reservation.user.firstName} ${reservation.user.surName}`,
        colXPositions.bookedBy + padding,
        yPosition,
        { width: 70 - padding, align: "left" }
      )
      .text(reservation.title, colXPositions.title + padding, yPosition, {
        width: 110 - padding,
        align: "left",
      })
      .text(
        formatDuration(reservation.startTime, reservation.endTime),
        colXPositions.duration + padding,
        yPosition,
        { width: 110 - padding, align: "left" }
      )
      .text(membersText, colXPositions.members + padding, yPosition, {
        width: 100 - padding,
        align: "left",
      });

    doc
      .lineWidth(0.5)
      .moveTo(20, yPosition - 15)
      .lineTo(580, yPosition - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(20, yPosition + rowHeight - 15)
      .lineTo(580, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(20, yPosition - 15)
      .lineTo(20, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(colXPositions.room, yPosition - 15)
      .lineTo(colXPositions.room, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(colXPositions.bookedBy, yPosition - 15)
      .lineTo(colXPositions.bookedBy, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(colXPositions.title, yPosition - 15)
      .lineTo(colXPositions.title, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(colXPositions.duration, yPosition - 15)
      .lineTo(colXPositions.duration, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(colXPositions.members, yPosition - 15)
      .lineTo(colXPositions.members, yPosition + rowHeight - 15)
      .stroke();

    doc
      .lineWidth(0.5)
      .moveTo(580, yPosition - 15)
      .lineTo(580, yPosition + rowHeight - 15)
      .stroke();

    yPosition += rowHeight;
  });

  if (yPosition > doc.page.height - 100) {
    doc.addPage();
  }
};

const GenerateMonthlyPDF = async (req, res) => {
  const doc = new PDFDocument();
  const filename = "monthly_reservations.pdf";

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/pdf");

  try {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const reservations = await ReserveModel.find({
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
      "approval.status": "Approved",
    })
      .populate("user", "firstName surName")
      .sort({ scheduleDate: 1, startTime: 1 });

    const monthName = getCurrentMonthName();
    generatePDFContent(doc, reservations, `Reservations for ${monthName}`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generating monthly reservations PDF:", error);
    res.status(500).json({
      message:
        "An error occurred while generating the monthly reservations PDF.",
      error: error.message,
    });
  }
};

const GenerateUserPDF = async (req, res) => {
  const { id } = req.params;

  const doc = new PDFDocument();
  const filename = "user_reservations.pdf";

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/pdf");

  try {
    const user = await UserModel.findById(id).select("firstName surName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const reservations = await ReserveModel.find({
      user: new mongoose.Types.ObjectId(id),
      "approval.status": "Approved",
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
    }).sort({ scheduleDate: 1, startTime: 1 });

    generatePDFContent(
      doc,
      reservations,
      `Reservations for ${user.firstName} ${user.surName}`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generating user reservations PDF:", error);
    res.status(500).json({
      message: "An error occurred while generating the user reservations PDF.",
      error: error.message,
    });
  }
};

const SendAdminAttachment = async (req, res) => {
  try {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const reservations = await ReserveModel.find({
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
      "approval.status": "Approved",
    })
      .populate("user", "firstName surName")
      .sort({ scheduleDate: 1, startTime: 1 });

    if (reservations.length === 0) {
      if (res) {
        return res.status(404).json({ message: "No reservations found for the month" });
      } else {
        console.log("No reservations found for the month");
        return;
      }
    }

    const monthName = getCurrentMonthName();

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      const emails = ["mw@flw.ph", "erika@flw.ph", "demry@flw.ph", "valloso@flw.ph", "pdmnpcdatadrmonitoring@gmail.com", "abagjeanne@flw.ph", "jdesena@flw.ph", "ellaneb@flw.ph"]; 
      const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Monthly Reservations - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
            <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
            <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Monthly Reservations</h2>
            <p>Attached is the summary of all reservations for the month. Please review the details below:</p>
            <ul>
              <li><strong>Number of Reservations:</strong> ${reservations.length}</li>
              <li><strong>Period:</strong> ${startOfMonth.toLocaleDateString()} to ${endOfMonth.toLocaleDateString()}</li>
            </ul>
            <p>Please find attached the detailed PDF with all reservations for the month.</p>
            <p>Best regards,</p>
            <p>Management</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.GMAIL_SENDER,
        to: emails,
        subject: "Monthly Reservations Report",
        html: htmlContent,
        attachments: [
          {
            filename: `${monthName}_Reservations.pdf`,
            content: pdfData,
            contentType: "application/pdf",
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        if (res) {
          res.status(200).json({ message: "Email sent successfully!" });
        } else {
          console.log("Email sent successfully!");
        }
      } catch (error) {
        if (res) {
          res.status(500).json({
            message: "An error occurred while sending the email.",
            error: error.message,
          });
        } else {
          console.error("An error occurred while sending the email:", error.message);
        }
      }
    });

    generatePDFContent(doc, reservations, `Reservations for ${monthName}`);
    doc.end();
  } catch (error) {
    if (res) {
      res.status(500).json({
        message: "An error occurred while generating the monthly reservations PDF.",
        error: error.message,
      });
    } else {
      console.error("An error occurred while generating the monthly reservations PDF:", error.message);
    }
  }
};

const SendAllAttachment = async () => {
  try {
    const users = await UserModel.find({ resetPass: true }).select("email firstName surName");

    if (!users.length) {
      return;
    }

    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const adminEmails = "pdmnpcdatadrmonitoring@gmail.com";

    const pdfPromises = users.map(async (user) => {
      const reservations = await ReserveModel.find({
        user: user._id,
        "approval.status": "Approved",
        scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
      })
        .populate("user", "firstName surName")
        .sort({ scheduleDate: 1, startTime: 1 });

      if (reservations.length > 0) {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", async () => {
          try {
            const pdfData = Buffer.concat(buffers);

            const monthName = getCurrentMonthName();
            const name = `${user.firstName} ${user.surName}`;
            const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

            const htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Monthly Reservations - GDS Booking System</title>
              </head>
              <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                  <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                  <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Monthly Reservations</h2>
                  <p>Hi ${name},</p>
                  <p>Attached is the summary of your reservations for the month. Please review the details below:</p>
                  <ul>
                    <li><strong>Number of Reservations:</strong> ${reservations.length}</li>
                    <li><strong>Period:</strong> ${startOfMonth.toLocaleDateString()} to ${endOfMonth.toLocaleDateString()}</li>
                  </ul>
                  <p>Please find attached the detailed PDF with all your reservations for the month.</p>
                  <p>Best regards,</p>
                  <p>Management</p>
                </div>
              </body>
              </html>
            `;

            const mailOptions = {
              from: process.env.GMAIL_SENDER,
              to: user.email,
              subject: "Monthly Reservations Report",
              html: htmlContent,
              attachments: [
                {
                  filename: `${user.surName}_${monthName}_Reservations.pdf`,
                  content: pdfData,
                  contentType: "application/pdf",
                },
              ],
            };

            try {
              await transporter.sendMail(mailOptions);
            } catch (error) {
              console.error(`Error sending email to ${user.email}:`, error.message);
            }
          } catch (error) {
            console.error("Error processing PDF for user:", error.message);
          }
        });

        generatePDFContent(doc, reservations, `Reservations for ${user.firstName} ${user.surName}`);
        doc.end();
      }
    });

    const pdfBuffers = [];
    const collectPDFPromises = users.map(async (user) => {
      const reservations = await ReserveModel.find({
        user: user._id,
        "approval.status": "Approved",
        scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
      })
        .populate("user", "firstName surName")
        .sort({ scheduleDate: 1, startTime: 1 });

      if (reservations.length > 0) {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers);
          pdfBuffers.push({
            filename: `${user.surName}_${getCurrentMonthName()}_Reservations.pdf`,
            content: pdfData,
            contentType: "application/pdf",
          });
        });

        generatePDFContent(doc, reservations, `Reservations for ${user.firstName} ${user.surName}`);
        doc.end();
      }
    });

    await Promise.all(pdfPromises);
    await Promise.all(collectPDFPromises);

    const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monthly Reservations - GDS Booking System</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
          <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
          <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Monthly Reservations Archive</h2>
          <p>Hi Admin,</p>
          <p>Attached are all the user reservation reports for the month to archive.</p>
          <p>Best regards,</p>
          <p>Management</p>
        </div>
      </body>
      </html>
    `;

    const mailOptionsToAdmin = {
      from: process.env.GMAIL_SENDER,
      to: adminEmails,
      subject: "Monthly Reservations Archive",
      html: htmlContent,
      attachments: pdfBuffers,
    };

    try {
      await transporter.sendMail(mailOptionsToAdmin);
      console.log("All user reservation PDFs have been sent to the admin.");
    } catch (error) {
      console.error("Error sending admin email:", error.message);
    }
  } catch (error) {
    console.error("Error generating and sending user reservations PDFs:", error);
  }
};

const SendUserAttachment = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findById(id).select("email firstName surName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reservations = await ReserveModel.find({
      user: new mongoose.Types.ObjectId(id),
      "approval.status": "Approved",
    })
      .populate("user", "firstName surName") // Ensure the user details are populated
      .sort({ scheduleDate: 1, startTime: 1 });

    if (reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for the user" });
    }

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      const emailz = "jamesdesena27@gmail.com";
      const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const monthName = getCurrentMonthName();
      const name = `${user.firstName} ${user.surName}`;

      const date = new Date();
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Monthly Reservations - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
            <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
            <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Monthly Reservations</h2>
            <p>Hi ${name},</p>
            <p>Attached is the summary of your reservations for the month. Please review the details below:</p>
            <ul>
              <li><strong>Number of Reservations:</strong> ${
                reservations.length
              }</li>
              <li><strong>Period:</strong> ${startOfMonth.toLocaleDateString()} to ${endOfMonth.toLocaleDateString()}</li>
            </ul>
            <p>Please find attached the detailed PDF with all your reservations for the month.</p>
            <p>Best regards,</p>
            <p>Management</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.GMAIL_SENDER,
        to: emailz,
        subject: "Monthly Reservations Report",
        html: htmlContent,
        attachments: [
          {
            filename: `${user.surName}_${monthName}_Reservations.pdf`,
            content: pdfData,
            contentType: "application/pdf",
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!" });
      } catch (error) {
        res.status(500).json({
          message: "An error occurred while sending the email.",
          error: error.message,
        });
      }
    });

    generatePDFContent(
      doc,
      reservations,
      `Reservations for ${user.firstName} ${user.surName}`
    );

    doc.end();
  } catch (error) {
    console.error("Error generating user reservations PDF:", error);
    res.status(500).json({
      message: "An error occurred while generating the user reservations PDF.",
      error: error.message,
    });
  }
};

const DeletePrevMonth = async () => {
  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  try {
    await ReserveModel.deleteMany({
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
    });

    await NotificationModel.deleteMany({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    });

    console.log("Successfully deleted reservations and notifications.");
  } catch (error) {
    console.error("Error deleting reservations and notifications:", error);
  }
};

cron.schedule('0 23 28-31 * *', async () => {
  console.log('Cron: Job started');
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  console.log(`Cron: Today: ${today.getDate()}, Last Day of Month: ${lastDayOfMonth}`);

  if (today.getDate() === lastDayOfMonth) {
    console.log('Cron: Executing end-of-month tasks');
    try {
      await Promise.all([
        SendAdminAttachment(),
        SendAllAttachment()
      ]);

      // console.log('Cron: Calling DeletePrevMonth...');
      // await DeletePrevMonth();
    } catch (error) {
      console.error("Cron: Error in end-of-month tasks:", error.stack || error.message || error);
    } finally {
      console.log('Cron: End of job execution');
    }
  }
});

// cron.schedule('0 23 28-31 * *', () => {
//   const today = new Date();
//   const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
//   if (today.getDate() === lastDayOfMonth) {
//     SendAllAttachment();
//     DeletePrevMonth();
//   }
// });

// cron.schedule('*/30 * * * * *', () => {
//   console.log('Running SendAdminAttachment');
//   SendAdminAttachment();
// });

// cron.schedule('*/30 * * * * *', () => {
//   console.log('Running SendAllAttachment');
//   SendAllAttachment();
// });

module.exports = {
  SendAdminAttachment,
  SendAllAttachment,
  SendUserAttachment,
};
