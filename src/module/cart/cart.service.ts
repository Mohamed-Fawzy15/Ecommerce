import { Injectable, BadRequestException } from '@nestjs/common';
import { addToCartDto } from './cart.dto';
import { CartRepository, ProductRepository } from 'DB';
import type { HUserDocument } from 'DB';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  async addToCart(body: addToCartDto, user: HUserDocument) {
    const { productId, quantity } = body;

    const product = await this.productRepo.findOne({
      filter: { _id: productId, stock: { $gte: quantity } },
    });
    if (!product) {
      throw new BadRequestException('product not found');
    }

    const cart = await this.cartRepo.findOne({
      filter: { createdBy: user._id },
    });

    if (!cart) {
      const newCart = await this.cartRepo.create({
        createdBy: user._id,
        products: [
          {
            product: productId,
            quantity,
            finalPrice: product.price,
          },
        ],
      });
      return newCart;
    }

    const productCart = cart.products.find(
      (product) => product.product.toString() === productId.toString(),
    );
    if (productCart) {
      throw new BadRequestException('product already in cart');
    }

    cart.products.push({
      product: productId,
      quantity,
      finalPrice: product.price,
    });
    await cart.save();
    return cart;
  }

  async removeFromCart(id: Types.ObjectId, user: HUserDocument) {
    const product = await this.productRepo.findOne({ filter: { _id: id } });
    if (!product) {
      throw new BadRequestException('product not found');
    }

    const cart = await this.cartRepo.findOne({
      filter: {
        createdBy: user._id,
        products: {
          $elemMatch: {
            product: id,
          },
        },
      },
    });

    if (!cart) {
      throw new BadRequestException('cart not found');
    }

    cart.products = cart.products.filter(
      (product) => product.product.toString() !== id.toString(),
    );

    await cart.save();
    return cart;
  }
}
