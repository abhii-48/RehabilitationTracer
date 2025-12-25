import nodemailer from 'nodemailer';

export const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // 1. Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ msg: 'Please fill in all fields' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Invalid email address' });
    }

    try {
        // 2. Setup Transporter
        // Using environment variables for security.
        // User needs to set EMAIL_USER and EMAIL_PASS in .env
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or use host/port if not using Gmail service shortcut
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 3. Email Options
        const mailOptions = {
            from: `"${name}" <${email}>`, // Functionally usually the auth user sends it, specifically due to SPF/DKIM, but we can set 'replyTo'
            to: 'nithintony361@gmail.com', // Fixed receiver
            replyTo: email,
            subject: `[RehabTracer Contact] – ${subject}`,
            text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `,
            html: `
<h3>New Contact Message via RehabTracer</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        // 4. Send Email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ msg: 'Message sent successfully' });

    } catch (err) {
        console.error('Email Error:', err);
        res.status(500).json({ msg: 'Server error: Failed to send email' });
    }
};
