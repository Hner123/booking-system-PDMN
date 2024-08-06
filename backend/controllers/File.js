const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const ReserveModel = require('../models/ReserveModel');
const UserModel = require('../models/UserModel');

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

const formatDuration = (startTime, endTime) => {
  const duration = new Date(endTime) - new Date(startTime);
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const getCurrentMonthName = () => {
  const options = { month: 'long' };
  return new Date().toLocaleDateString(undefined, options);
};

const generatePDFContent = (doc, reservations, title) => {
  // Title and header section
  doc.fontSize(18).text('GDS Monthly Reservation', { align: 'center' });
  doc.fontSize(25).text(title, { align: 'center' });
  doc.moveDown(2); // Move down to start the table

  // Table header
  doc.fontSize(12)
     .text('Date', 50, 100, { continued: true })
     .text('Booked By', 150, 100, { continued: true })
     .text('Title', 250, 100, { continued: true })
     .text('Duration', 350, 100, { continued: true })
     .text('Members', 450, 100);
  
  doc.lineWidth(1)
     .moveTo(50, 110)
     .lineTo(500, 110)
     .stroke();

  // Table rows
  let yPosition = 120;
  reservations.forEach((reservation, index) => {
    if (yPosition > doc.page.height - 100) {
      doc.addPage();
      doc.fontSize(12)
         .text('Date', 50, 100, { continued: true })
         .text('Booked By', 150, 100, { continued: true })
         .text('Title', 250, 100, { continued: true })
         .text('Duration', 350, 100, { continued: true })
         .text('Members', 450, 100);
      
      doc.lineWidth(1)
         .moveTo(50, 110)
         .lineTo(500, 110)
         .stroke();

      yPosition = 120; // Reset yPosition for the new page
    }
    
    doc.fontSize(10)
       .text(formatDate(reservation.scheduleDate), 50, yPosition, { continued: true })
       .text(`${reservation.user.firstName} ${reservation.user.surName}`, 150, yPosition, { continued: true })
       .text(reservation.title, 250, yPosition, { continued: true })
       .text(formatDuration(reservation.startTime, reservation.endTime), 350, yPosition, { continued: true })
       .text([...reservation.attendees, reservation.guest].join(', '), 450, yPosition);
    
    yPosition += 30; // Move to the next row
  });

  if (yPosition > doc.page.height - 100) {
    doc.addPage(); // Add a final page if necessary
  }
};

const GenerateMonthlyPDF = async (req, res) => {
  const doc = new PDFDocument();
  const filename = 'monthly_reservations.pdf';

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const reservations = await ReserveModel.find({
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth }
    })
    .populate('user', 'firstName surName')
    .sort({ scheduleDate: 1 });  // Sort reservations by scheduleDate in ascending order

    const monthName = getCurrentMonthName();
    generatePDFContent(doc, reservations, `Reservations for ${monthName}`);
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).send('Error generating PDF: ' + error.message);
    if (!doc._finished) {
      doc.end();
    }
  }
};

const GenerateUserPDF = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json("Invalid User ID");
  }

  const doc = new PDFDocument();
  const filename = `user_reservations_${id}.pdf`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');

  try {
    const reservations = await ReserveModel.find({ user: id })
      .populate('user', 'firstName surName')
      .sort({ scheduleDate: 1 });  // Sort reservations by scheduleDate in ascending order

    generatePDFContent(doc, reservations, `Reservations for User ${id}`);
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).send('Error generating PDF: ' + error.message);
    if (!doc._finished) {
      doc.end();
    }
  }
};

module.exports = {
  GenerateMonthlyPDF,
  GenerateUserPDF
};
