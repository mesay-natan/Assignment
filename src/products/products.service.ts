import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { AdjustProductDto } from './dto/adjust-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}
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
  
  async status(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: {id},
      select: ['id', 'name', 'stockQuantity'],
    })
    if (!product) {
      throw new NotFoundException(`Product with id not found`);
    }
    return product;
  }

  async adjustProduct(dto: AdjustProductDto): Promise<Product> {
    const { productId, delta } = dto;
    if (delta === 0) throw new BadRequestException('delta must not be 0');

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const product = await productRepo.findOne({
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) throw new NotFoundException(`Product with id ${productId} not found`);

      const nextStock = product.stockQuantity + delta;
      if (nextStock < 0) throw new BadRequestException('Insufficient stock');

      product.stockQuantity = nextStock;
      return productRepo.save(product);
    });
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
