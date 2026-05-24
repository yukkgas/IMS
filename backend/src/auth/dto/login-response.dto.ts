import { Role } from '@prisma/client';

export class UserDto {
  id: string;
  email: string;
  role: Role;
}

export class LoginResponseDto {
  accessToken: string;
  user: UserDto;
}
