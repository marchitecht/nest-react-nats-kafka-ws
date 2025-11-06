import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
    jwtFromRequest: ExtractJwt.fromExtractors([
    (req) =>{ 
      return req.cookies?.jwt
    },
    ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'qwer',
    });
  }

  async validate(payload: any) {
    return { email: payload.email }; // добавляем данные пользователя в req.user
  }
}