import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  const dto: LoginDto = { email: 'test@test.com', password: 'password123' };
  const mockLoginResponse = {
    accessToken: 'fakeJwtToken',
    user: { id: '123', email: 'test@test.com', role: Role.STOREKEEPER },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.mocked(authService.login).mockResolvedValue(mockLoginResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct DTO and return its result', async () => {
      const result = await controller.login(dto);

      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if authService.login fails', async () => {
      const error = new UnauthorizedException();
      jest.mocked(authService.login).mockRejectedValue(error);

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
