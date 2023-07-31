import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signIn(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
      select: {
        id: true,
        email: true,
        hash: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const pwMatches = argon.verify(user.hash, authDto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Wrong password');
    }

    delete user.hash;
    return this.signToken(user.id, user.email);
  }

  async signUp(authDto: AuthDto) {
    const hash = await argon.hash(authDto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
