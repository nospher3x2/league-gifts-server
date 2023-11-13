import { PasswordModule } from '@common';
import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthConfigService } from './config/auth.config.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt_secret_key'),
        signOptions: { expiresIn: config.getOrThrow<string>('jwt_expires_in') },
      }),
    }),
    PasswordModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthConfigService, AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
