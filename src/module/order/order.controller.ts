import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, idDto } from './order.dto';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Post()
  async createOrder(@Body() body: CreateOrderDto, @User() user: HUserDocument) {
    return this.orderService.createOrder(body, user);
  }

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Post('/stripe/:id')
  async paymentWithStripe(@Param() params: idDto, @User() user: HUserDocument) {
    return this.orderService.paymentWithStripe(params.id, user);
  }

  @Post('/webhook')
  async webhook(@Body() body: any) {
    return this.orderService.webhook(body);
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Patch('refund/:id')
  async refundedOrders(@Param() params: idDto, @User() user: HUserDocument) {
    return this.orderService.refundedOrders(params.id, user);
  }
}
