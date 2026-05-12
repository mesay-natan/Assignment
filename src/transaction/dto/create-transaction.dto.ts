import { IsDecimal, IsInt, Min } from "class-validator";

export class CreateTransactionDto {
    @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}
