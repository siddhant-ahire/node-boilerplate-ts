import nodemailer from 'nodemailer';

// Function to send the reset email
async function sendResetEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true, // Enables pooling of connections
    });

    // Send the email
    await transporter.sendMail({
      to: to,
      from: process.env.EMAIL_USER as string,
      subject: subject,
      html: html,
    });

    // Close the transporter to avoid hanging
    transporter.close();

    console.log('Email sent successfully!');
    // Let the parent process know the email was sent
    if (process.send) {
      process.send({ success: true });
    }

    // Exit the child process
    process.exit(0);
  } catch (error) {
    console.error('Error sending email:', (error as Error).message);
    process.send?.({ success: false, error: (error as Error).message });

    // Exit the child process with an error code
    process.exit(1);
  }
}

// Handle message from the parent process
process.on(
  'message',
  ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    sendResetEmail(to, subject, html);
  }
);
