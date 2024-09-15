const jwt = require('jsonwebtoken');
import { fork } from 'child_process';
import path from 'path';

export const generateAccessToken = (user_id: number): string => {
  return jwt.sign({ user_id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

export const generateRefreshToken = (user_id: number): string => {
  return jwt.sign({ user_id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });
};

// Function to handle email sending in a child process
export function sendEmailInChildProcess(
  email: string,
  resetToken: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(__dirname, '../services/sendMailProcess.ts'));

    // Send the email data to the child process
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    let to = email;
    let subject = 'Password Reset Request';
    let html = `<p>To reset your password, please click on the following link: <a href="${resetUrl}">${resetUrl}</a></p>`;

    child.send({ to, subject, html });

    // Listen for messages from the child process
    child.on('message', (message: { success: boolean; error?: string }) => {
      if (message.success) {
        resolve('Email sent successfully');
        child.kill(); // Kill the child process to prevent it from hanging
      } else {
        reject(new Error(`Failed to send email: ${message.error}`));
      }
    });

    // Handle error from the child process
    child.on('error', (error) => {
      reject(error);
    });

    // Handle unexpected child process exit
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}
