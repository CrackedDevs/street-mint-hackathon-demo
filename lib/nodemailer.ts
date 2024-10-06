import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const username = process.env.EMAIL_USERNAME;
const password = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: username,
        pass: password
    }
});

export const sendTipLinkUrlMail = async (email: string, tiplinkUrl: string): Promise<SMTPTransport.SentMessageInfo> => {
    const mail = await transporter.sendMail({
        from: username,
        to: email,
        replyTo: username,
        subject: `Website activity from ${email}`,
        html: `
        <p>Email: ${email} </p>
        <p>Message:  </p>
        `,
    })
    return mail
}