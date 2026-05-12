import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStatusController } from './status.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController, ProductStatusController],
  providers: [ProductsService],
})
export class ProductsModule {}
