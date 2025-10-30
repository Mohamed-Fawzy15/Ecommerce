/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { EventEmitter } from 'events';
import { emailTemplate } from './email.template';
import { sendEmail } from './sendEmail';
import { OtpTypeEnum } from 'src/common/enums';

export const eventEmitter = new EventEmitter();

eventEmitter.on(OtpTypeEnum.CONFIRM_EMAIL, async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: OtpTypeEnum.CONFIRM_EMAIL,
    html: emailTemplate(otp as unknown as string, 'Email Confirmation'),
  });
});

eventEmitter.on(OtpTypeEnum.FORGET_PASSWORD, async (data) => {
  const { email, otp } = data;

  await sendEmail({
    to: email,
    subject: OtpTypeEnum.FORGET_PASSWORD,
    html: emailTemplate(otp as unknown as string, 'Forget Password'),
  });
});
