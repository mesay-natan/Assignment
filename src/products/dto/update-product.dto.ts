import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Column } from 'typeorm';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @Column({type: 'varchar', length: 255})
        name?: string;
        @Column({type: 'varchar', length: 255})
        description?: string;
        @Column('decimal', { precision: 10, scale: 2 })
        price?: number;
        @Column('int')
        stockQuantity?: number;
}
