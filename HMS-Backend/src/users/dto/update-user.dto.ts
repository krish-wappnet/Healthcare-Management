import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/user-roles.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false, example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  emailVerified?: boolean;
}