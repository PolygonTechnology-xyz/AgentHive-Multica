import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum([UserRole.BUYER, UserRole.FREELANCER])
  role: UserRole.BUYER | UserRole.FREELANCER;

  @IsOptional()
  @IsString()
  displayName?: string;
}
