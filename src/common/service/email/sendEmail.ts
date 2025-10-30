import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export const sendEmail = async (mailOption: Mail.Options) => {
  const authUser = 'mohamedfawzyelsakaa@gmail.com';
  const authPass = 'qjxhrizfbvfgxfet';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: authUser,
      pass: authPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"SocialMediaApp" <${authUser}>`,
      ...mailOption,
    });
    // Basic diagnostics to verify delivery
    console.log(`Email sent: messageId=${info.messageId}`);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${String(error)}`);
    throw error;
  }
};

export const generateOTP = (): number => {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
