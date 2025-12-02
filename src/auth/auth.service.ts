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

    // Check if user already exists
    try {
      await this.usersService.findOneByEmail(email);
      throw new BadRequestException('User with this email already exists');
    } catch (error) {
      if (error.status === 400) {
        throw error;
      }
      // User doesn't exist, continue
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      fullName,
      email,
      password: hashedPassword,
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
    const isPasswordValid = await bcrypt.compare(password, user.password);

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
    return await this.usersService.findOne(uuid);
  }
}
