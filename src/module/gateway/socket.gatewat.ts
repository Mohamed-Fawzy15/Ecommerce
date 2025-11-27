import { Types } from 'mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Auth } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import { TokenService } from 'src/common/service/token/token.service';

@WebSocketGateway(3001, {
  namespace: '/socket',
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly tokenService: TokenService) {}

  @WebSocketServer()
  private io: Server;

  @Auth({
    role: [UserRole.admin, UserRole.user],
    typeToken: TokenType.access,
  })
  @SubscribeMessage('message')
  handleMessageEvent(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    console.log('Message from user:', user?.email, 'Data:', data);

    this.io.emit('message', {
      msg: 'Message received from back',
      user: user?.email,
      data,
    });
  }

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token) {
        console.log('No token provided, disconnecting client:', socket.id);
        socket.disconnect();
        return;
      }

      const [prefix, actualToken] = token.split(' ');

      if (!actualToken) {
        console.log('Invalid token format, disconnecting client:', socket.id);
        socket.disconnect();
        return;
      }

      const signature = await this.tokenService.GetSignature(prefix);

      if (!signature) {
        console.log('Invalid bearer prefix, disconnecting client:', socket.id);
        socket.disconnect();
        return;
      }

      const { decoded, user } =
        await this.tokenService.decodedTokenAndFetchUser(
          actualToken,
          signature,
        );

      socket.data.user = user;
      socket.data.decoded = decoded;

      console.log(
        'Client authenticated and connected:',
        socket.id,
        'User:',
        user.email,
      );
    } catch (error) {
      console.log(
        'Authentication failed, disconnecting client:',
        socket.id,
        error.message,
      );
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userEmail = socket.data.user?.email || 'Unknown';
    console.log('Client disconnected:', socket.id, 'User:', userEmail);
  }

  handleProductQunatityChange(
    productId: Types.ObjectId | string,
    quantity: number,
  ) {
    this.io.emit('productQuantityChange', { productId, quantity });
  }

  handleCartCleared(userId: Types.ObjectId | string) {
    this.io.emit('cartCleared', { userId });
  }

  handleProductChange(
    action: 'created' | 'updated' | 'deleted',
    productId: Types.ObjectId | string,
    data?: any,
  ) {
    this.io.emit('productChange', { action, productId, data });
  }

  handleBrandChange(
    action: 'created' | 'updated' | 'deleted',
    brandId: Types.ObjectId | string,
    data?: any,
  ) {
    this.io.emit('brandChange', { action, brandId, data });
  }

  handleCategoryChange(
    action: 'created' | 'updated' | 'deleted',
    categoryId: Types.ObjectId | string,
    data?: any,
  ) {
    this.io.emit('categoryChange', { action, categoryId, data });
  }

  handleSubCategoryChange(
    action: 'created' | 'updated' | 'deleted',
    subCategoryId: Types.ObjectId | string,
    data?: any,
  ) {
    this.io.emit('subCategoryChange', { action, subCategoryId, data });
  }

  handleCouponChange(
    action: 'created' | 'updated' | 'deleted',
    couponId: Types.ObjectId | string,
    data?: any,
  ) {
    this.io.emit('couponChange', { action, couponId, data });
  }

  handleOrderStatusChange(
    orderId: Types.ObjectId | string,
    status: string,
    userId: Types.ObjectId | string,
  ) {
    this.io.emit('orderStatusChange', { orderId, status, userId });
  }
}
