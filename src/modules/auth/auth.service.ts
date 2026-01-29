import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    const passwordToCompare = user?.password ?? 'force_bcrypt_delay';
    const isMatch = await bcrypt.compare(pass, passwordToCompare);

    if (!user || !isMatch) {
      this.logger.warn({ msg: 'Tentativa de login inválida' });
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    return user;
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id };
    this.logger.log({ msg: 'Gerando token de acesso', userId: user.id });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
