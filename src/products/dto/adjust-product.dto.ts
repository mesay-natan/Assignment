import { IsInt, Min } from 'class-validator';

export class AdjustProductDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  delta!: number;
}

