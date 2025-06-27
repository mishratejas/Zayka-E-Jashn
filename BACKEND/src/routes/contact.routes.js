import express from 'express';
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
 router.post("/send-email",async(req,res)=>{
    const {name,email,subject,message}=req.body;

    if(!name || !email || !subject || !message){
        return res.status(400).jsom({message:"All fields are required"});
    }

    try{
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,  // You receive the mail
      subject: `New Contact: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Email failed to send" });
  }
});

export default router;