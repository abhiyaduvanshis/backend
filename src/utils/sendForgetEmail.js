import nodemailer from 'nodemailer'
import { forgetEmailTemplate } from '../template/forgetEmailTemplate.js';

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const forgetPasswordEmail = async(req, res)=>{
  try {
    const htmlBody = await forgetEmailTemplate(req)
    let mailOptions = {
    from: '"Reset Your Password" <abhi.jkit@gmail.com>',
    to: req?.email,
    subject: 'Reset Your Password',
    text: 'Reset Your Password',
    html: htmlBody
    };
   const info = await transporter.sendMail(mailOptions);
    return info
  } catch (error) {
       console.error('Error sending mail:', error);
    return error
  }
}

export {forgetPasswordEmail}