import { Column } from "typeorm";

export class CreateProductDto {
    @Column({type: 'varchar', length: 255})
        name!: string;
        @Column({type: 'varchar', length: 255})
        description?: string;
        @Column('decimal', { precision: 10, scale: 2 })
        price!: number;
        @Column('int')
        stockQuantity!: number;
}
