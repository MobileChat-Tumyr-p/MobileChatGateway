import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class StartCallDto {
  @IsInt()
  public calleeId!: number;

  @IsOptional()
  @IsNumber()
  public chatId?: number | null = null;
}
