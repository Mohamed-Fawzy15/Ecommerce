import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth, User } from 'src/common/decorators';
import { TokenType, UserRole } from 'src/common/enums';
import type { HUserDocument } from 'DB';
import { addToCartDto, idDto, updateQuantityDto } from './cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Post()
  async addToCart(@Body() body: addToCartDto, @User() user: HUserDocument) {
    const product = await this.cartService.addToCart(body, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Delete('remove/:id')
  async removeFromCart(@Param() param: idDto, @User() user: HUserDocument) {
    const product = await this.cartService.removeFromCart(param.id, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Patch('updateQuantity/:id')
  async updateQuantity(
    @Body() body: updateQuantityDto,
    @Param() param: idDto,
    @User() user: HUserDocument,
  ) {
    const product = await this.cartService.updateQuantity(body, param.id, user);
    return { message: 'done', product };
  }

  @Auth({ role: [UserRole.admin, UserRole.user], typeToken: TokenType.access })
  @Delete('clear')
  async clearCart(@User() user: HUserDocument) {
    const cart = await this.cartService.clearCart(user);
    return { message: 'cart cleared successfully', cart };
  }
}
