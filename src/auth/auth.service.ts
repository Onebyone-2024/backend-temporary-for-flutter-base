import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;

    // Create user (password hashing and duplicate check handled in UsersService)
    const user = await this.usersService.createUser({
      fullName,
      email,
      password,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'User registered successfully',
      user: {
        uuid: user.uuid,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'Login successful',
      user: {
        uuid: user.uuid,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
      },
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private generateToken(user: any) {
    const payload = {
      uuid: user.uuid,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(uuid: string) {
    return await this.usersService.findOneById(uuid);
  }
}
