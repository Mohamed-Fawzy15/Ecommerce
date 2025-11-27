import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gatewat';
import { TokenService } from 'src/common/service/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'DB';
import { UserModel } from 'DB/models';

@Module({
  imports: [UserModel],
  providers: [SocketGateway, TokenService, JwtService, UserRepository],
  exports: [SocketGateway],
})
export class GatewayModule {}
