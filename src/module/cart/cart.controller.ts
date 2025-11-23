import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';
import { addToCartDto, idDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Post()
  async addToCart(@Body() body: addToCartDto, @User() user: HUserDocument) {
    const product = await this.cartService.addToCart(body, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin], typeToken: TokenType.access })
  @Delete('remove/:id')
  async removeFromCart(@Param() param: idDto, @User() user: HUserDocument) {
    const product = await this.cartService.removeFromCart(param.id, user);
    return { message: 'done', product };
  }
}
