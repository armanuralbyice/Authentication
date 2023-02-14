const nodemailer = require('nodemailer');

const sendEmail =async options=>{
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "2fb9eeb97d2762",
            pass: "4317531100a95e"
        }
    });
    const message ={
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transport.sendMail(message)
}

module.exports = sendEmail
