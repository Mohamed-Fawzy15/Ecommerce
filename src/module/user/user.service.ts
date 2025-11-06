import { TokenService } from './../../common/service/token/token.service';
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  AddUserDto,
  confirmEmailDto,
  loginDto,
  reSendOtpDto,
} from './user.dto';
import { OtpRepository, UserRepository } from 'DB';
import { emailTemplate, generateOTP, sendEmail } from 'src/common/service';
import { OtpTypeEnum, UserRole } from 'src/common/enums';
import { Types } from 'mongoose';
import { Compare } from 'src/common/hash';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly otpRepo: OtpRepository,
    private jwtService: JwtService,
    private readonly tokenService: TokenService,
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
  async login(body: loginDto) {
    const { email, password } = body;

    const user = await this.userRepo.findOne({
      filter: {
        email,
        confirmed: { $exists: true },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or already confirmed');
    }

    const isValidPassword = await Compare(password, user.password);

    if (!isValidPassword) {
      throw new BadRequestException('invalid password');
    }
    const access_token = await this.tokenService.generateToken({
      payload: { userId: user._id },
      options: {
        secret:
          user.role === UserRole.user
            ? process.env.SECRET_USER_TOKEN
            : process.env.SECRET_ADMIN_TOKEN,
        expiresIn: '1d',
      },
    });
    const refresh_token = await this.tokenService.generateToken({
      payload: { userId: user._id },
      options: {
        secret:
          user.role === UserRole.user
            ? process.env.REFRESH_SECRET_USER_TOKEN
            : process.env.REFRESH_SECRET_ADMIN_TOKEN,
        expiresIn: '1y',
      },
    });
    return { message: 'done', access_token, refresh_token };
  }
}
