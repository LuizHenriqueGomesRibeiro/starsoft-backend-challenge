import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: User) {
    return this.userService.create(createUserDto);
  }
}
