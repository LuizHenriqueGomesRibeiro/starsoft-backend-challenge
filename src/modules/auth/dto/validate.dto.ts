import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubDto {
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  @IsNotEmpty({ message: 'Sub é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'O sub é obrigatório' })
  sub: string;
}
