import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles, ROLES_KEY } from './roles.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call SetMetadata with ROLES_KEY and the provided roles', () => {
    const roles: Role[] = [Role.STOREKEEPER];
    
    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
    expect(SetMetadata).toHaveBeenCalledTimes(1);
  });

  it('should call SetMetadata with an empty array if no roles are provided', () => {
    Roles();

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, []);
    expect(SetMetadata).toHaveBeenCalledTimes(1);
  });
});
