import nodemailer from 'nodemailer'
import { emailTemplate } from '../template/emailTemplate.js';

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const sendEmailToUser = async(req, res)=>{
  try {
    const htmlBody = await emailTemplate(req)
    let mailOptions = {
    from: '"Test" <abhi.jkit@gmail.com>',
    to: req?.email,
    subject: 'User register verfication',
    text: 'This is a test email sent from a Node.js script!',
    html: htmlBody
    };
   const info = await transporter.sendMail(mailOptions);
    return info
  } catch (error) {
       console.error('Error sending mail:', error);
    return error
  }
}

export {sendEmailToUser}