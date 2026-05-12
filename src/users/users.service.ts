import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.repo.save(this.repo.create({ ...createUserDto }));
  }

  findAll(): Promise<User[]> {
    return this.repo.find({
      order: { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const res = await this.repo.update({ id }, { ...updateUserDto });
    if (res.affected === 0) {
      throw new NotFoundException(`User with id not found`);
    }
    return this.findOne(id);
  }

  remove(id: number): Promise<User> {
    return this.repo.findOne({ where: { id } }).then((user) => {
      if (!user) throw new NotFoundException(`User with id not found`);
      return this.repo.remove(user);
    });
  }
}
