import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: ParseIntPipe, @Body() updateProductDto: UpdateProductDto) : Promise<Product> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
  
  async remove(@Param('id') id: ParseIntPipe): Promise<void> {
    await this.productsService.remove(+id);
  }
}
