import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: 'd3b07384-d113-4956-a5cc-98d9a244439c',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@test.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.STOREKEEPER,
  })
  role: Role;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User details',
    type: UserDto,
  })
  user: UserDto;
}
