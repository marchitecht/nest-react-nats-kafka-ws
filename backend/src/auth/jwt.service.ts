import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { email: string; name: string }) {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
    });
  }
}
