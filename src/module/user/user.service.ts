/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AddUserDto, confirmEmailDto, reSendOtpDto } from './user.dto';
import { OtpRepository, UserRepository } from 'DB';
import { emailTemplate, generateOTP, sendEmail } from 'src/common/service';
import { OtpTypeEnum } from 'src/common/enums';
import { Types } from 'mongoose';
import { Compare } from 'src/common/hash';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly otpRepo: OtpRepository,
  ) {}

  private async sendOtp(userId: Types.ObjectId, email: string) {
    const otp = generateOTP();

    await this.otpRepo.create({
      code: otp.toString(),
      createdBy: userId,
      type: OtpTypeEnum.CONFIRM_EMAIL,
      expireAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: 'Confirm Email',
      html: emailTemplate(otp.toString(), 'confirmEmail'),
    });
  }

  async addUser(body: AddUserDto) {
    const { email, password, age, fName, lName } = body;
    const userExist = await this.userRepo.findOne({ email: email });
    if (userExist) {
      throw new BadRequestException('user already exists');
    }
    const user = await this.userRepo.create({
      email,
      password,
      age,
      fName,
      lName,
    });

    const userId = new Types.ObjectId(user._id);
    await this.sendOtp(userId, email);

    return { message: 'User added successfully', data: user };
  }

  async reSendOtp(body: reSendOtpDto) {
    const { email } = body;

    const user = await this.userRepo.findOne({
      filter: {
        email,
        confirmed: { $ne: true },
      },
      options: {
        populate: [{ path: 'otp' }],
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or already confirmed');
    }

    if (user.otp && Array.isArray(user.otp) && user.otp.length > 0) {
      const latestOtp = user.otp[user.otp.length - 1];
      if (latestOtp.expireAt > new Date()) {
        throw new BadRequestException('OTP already sent and still valid');
      }
    }

    const userId = new Types.ObjectId(user._id);
    await this.sendOtp(userId, email);

    return { message: 'OTP sent successfully' };
  }

  async signUp(body: AddUserDto) {
    const { email, password, age, fName, lName } = body;

    const userExist = await this.userRepo.findOne({ email });
    if (userExist) {
      throw new ConflictException('user already exist');
    }

    const user = await this.userRepo.create({
      email,
      password,
      age,
      fName,
      lName,
    });

    if (!user) {
      throw new ForbiddenException('user not created');
    }

    const userId = new Types.ObjectId(user._id);
    await this.sendOtp(userId, email);

    return user;
  }

  async confirmEmail(body: confirmEmailDto) {
    const { email, code } = body;

    const user = await this.userRepo.findOne({
      filter: {
        email,
        confirmed: { $ne: true },
      },
      options: {
        populate: [{ path: 'otp' }],
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or already confirmed');
    }

    if (!user.otp || (Array.isArray(user.otp) && user.otp.length === 0)) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    const otpData = Array.isArray(user.otp) ? user.otp[0] : user.otp;

    if (!otpData) {
      throw new BadRequestException('Invalid OTP data');
    }

    if (new Date() > new Date(otpData.expireAt)) {
      await this.otpRepo.deleteOne({ filter: { createdBy: user._id } });
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    const isValidOtp = await Compare(code, otpData.code);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP code');
    }
    user.confirmed = true;
    await user.save();

    await this.otpRepo.deleteOne({ filter: { createdBy: user._id } });
    return { message: 'Email confirmed successfully' };
  }
}
