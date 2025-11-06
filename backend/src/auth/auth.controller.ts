import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,           // Внедряем
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const token = this.authService.generateToken(req.user);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect('http://localhost:5173/messages');
  }
    
@Get('check')
  async check(@Req() req, @Res() res) {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: 'No token' });
    }

    try {
      const payload = this.jwtService.verify(token);
      return res.json({ user: payload }); // sub, email и т.д.
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  @Post('logout')
  logout(@Res() res) {
    // теперь TypeScript точно видит clearCookie
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.status(200).json({ message: 'Logged out' });
  }
}