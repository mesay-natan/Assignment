import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller()
export class ProductStatusController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('status/:productId')
  async status(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productsService.status(productId);
    return {
      productId: product.id,
      stockQuantity: product.stockQuantity,
      inStock: product.stockQuantity > 0,
    };
  }
}

