import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);

      if (isMatch) {
        return user;
      }
    }

    throw new UnauthorizedException('E-mail ou senha inválidos');
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
    };
  }
}
