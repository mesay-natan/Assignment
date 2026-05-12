import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction) private readonly repo: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { productId, quantity, userId } = createTransactionDto;

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const txRepo = manager.getRepository(Transaction);

      const product = await productRepo.findOne({
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!product) throw new NotFoundException(`Product with id not found`);

      if (product.stockQuantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      product.stockQuantity -= quantity;
      await productRepo.save(product);

      const tx = txRepo.create({
        userId,
        productId,
        quantity,
        unitPrice: Number(product.price),
      });
      return txRepo.save(tx);
    });
  }

  findAll(): Promise<Transaction[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.repo.findOne({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
    return transaction;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const txRepo = manager.getRepository(Transaction);

      const existing = await txRepo.findOne({ where: { id } });
      if (!existing) throw new NotFoundException(`Transaction with id ${id} not found`);

      const nextProductId = updateTransactionDto.productId ?? existing.productId;
      const nextQuantity = updateTransactionDto.quantity ?? existing.quantity;
      const nextUserId = updateTransactionDto.userId ?? existing.userId;

      if (nextQuantity <= 0) throw new BadRequestException('quantity must be >= 1');

      // Lock affected products in a stable order to reduce deadlock risk.
      const affectedProductIds = [existing.productId, nextProductId].sort((a, b) => a - b);
      const affectedProducts = await Promise.all(
        affectedProductIds.map((pid) =>
          productRepo.findOne({
            where: { id: pid },
            lock: { mode: 'pessimistic_write' },
          }),
        ),
      );

      const oldProduct = affectedProducts[affectedProductIds.indexOf(existing.productId)];
      const newProduct = affectedProducts[affectedProductIds.indexOf(nextProductId)];

      if (!oldProduct) throw new NotFoundException(`Product with id ${existing.productId} not found`);
      if (!newProduct) throw new NotFoundException(`Product with id ${nextProductId} not found`);

      if (existing.productId === nextProductId) {
        const delta = nextQuantity - existing.quantity;
        if (delta > 0 && newProduct.stockQuantity < delta) {
          throw new BadRequestException('Insufficient stock');
        }
        newProduct.stockQuantity -= delta;
        await productRepo.save(newProduct);
      } else {
        // return stock to old product and take from new product
        oldProduct.stockQuantity += existing.quantity;
        if (newProduct.stockQuantity < nextQuantity) {
          throw new BadRequestException('Insufficient stock');
        }
        newProduct.stockQuantity -= nextQuantity;
        await productRepo.save([oldProduct, newProduct]);
      }

      existing.userId = nextUserId;
      existing.productId = nextProductId;
      existing.quantity = nextQuantity;
      existing.unitPrice = Number(newProduct.price);

      return txRepo.save(existing);
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }
  }
}
