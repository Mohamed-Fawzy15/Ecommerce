import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { TokenType } from 'src/common/enums';
import { UserRepository } from 'DB';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async generateToken({
    payload,
    options,
  }: {
    payload: object;
    options?: JwtSignOptions;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async verifyToken({
    token,
    options,
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, options) as JwtPayload;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async GetSignature(prefix: string, tokenType: TokenType = TokenType.access) {
    if (tokenType == TokenType.access) {
      if (prefix == process.env.BEARER_USER) {
        return process.env.SECRET_USER_TOKEN;
      } else if (prefix == process.env.BEARER_ADMIN) {
        return process.env.SECRET_ADMIN_TOKEN;
      } else {
        return null;
      }
    }

    if (tokenType == TokenType.refresh) {
      if (prefix == process.env.BEARER_USER) {
        return process.env.REFRESH_SECRET_USER_TOKEN;
      } else if (prefix == process.env.BEARER_ADMIN) {
        return process.env.REFRESH_SECRET_ADMIN_TOKEN;
      } else {
        return null;
      }
    }

    return null;
  }

  async decodedTokenAndFetchUser(token: string, signature: string) {
    const decoded = await this.verifyToken({
      token,
      options: { secret: signature },
    });

    if (!decoded) {
      throw new BadRequestException('invalid Token');
    }

    const user = await this.userRepo.findOne({ email: decoded.email });
    if (!user) {
      throw new BadRequestException('User not exist');
    }
    if (!user?.confirmed) {
      throw new BadRequestException('please confirm email first');
    }

    // if (await _revokeTokenModel.findOne({ tokenId: decoded?.jti })) {
    //   throw new BadRequestException('token is revoked');
    // }

    // if (user?.changeCredntials?.getTime()! > decoded?.iat! * 1000) {
    //   throw new BadRequestException('Credentials changed');
    // }

    return { decoded, user };
  }
}
