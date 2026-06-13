import { ExecutionContext } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { currentUserFactory } from './current-user.decorator';

describe('currentUserFactory', () => {
  const mockUser = {
    id: '123',
    email: 'test@test.com',
    role: Role.ADMIN,
  };

  const createMockContext = (userObj: Partial<User> | undefined) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userObj,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should return the entire user object if the data parameter is not provided', () => {
    const mockContext = createMockContext(mockUser);

    const result = currentUserFactory(undefined, mockContext);

    expect(result).toEqual(mockUser);
  });

  it('should return a specific user property if the data parameter is provided', () => {
    const mockContext = createMockContext(mockUser);

    const result = currentUserFactory('email', mockContext);

    expect(result).toBe(mockUser.email);
  });

  it('should return undefined if the requested property does not exist', () => {
    const mockContext = createMockContext(mockUser);

    const result = currentUserFactory('nonExistentField', mockContext);

    expect(result).toBeUndefined();
  });

  it('should return undefined if the user object is not in the request object', () => {
    const mockContext = createMockContext(undefined);

    const result = currentUserFactory(undefined, mockContext);

    expect(result).toBeUndefined();
  });
});
