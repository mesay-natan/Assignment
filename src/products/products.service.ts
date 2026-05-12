import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ){}
  create(createProductDto: CreateProductDto): Promise<Product> {
    return this.repo.save(this.repo.create({ ...createProductDto }));
  }

  findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id }});
    if (!product) {
      throw new NotFoundException(`Product with id not found`);
    }
    return product;
  }
  

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const result = await this.repo.update({ id }, {...updateProductDto});
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id not found`);
    }
    return this.findOne(id);
  }

  remove(id: number): Promise<Product> {
    return this.repo.findOne({ where: { id } }).then((product) => {
          if (!product) throw new NotFoundException(`Product with id ${id} not found`);
          return this.repo.remove(product);
        });
  }
}
