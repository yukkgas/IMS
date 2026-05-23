import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from './hashing.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let hashingService: HashingService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockHashingService = {
    compare: jest.fn(),
  };

  const dto: LoginDto = { email: 'test@test.com', password: 'password123' };

  const getMockUser = (overrides?: Partial<User>): User => ({
    id: '123456',
    email: 'test@test.com',
    password_hash: 'hashedPassword',
    role: 'STOREKEEPER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    hashingService = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    const mockUser = getMockUser();

    it('Should return user if provided credentials are valid', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      jest.mocked(hashingService.compare).mockResolvedValue(true);

      const result = await authService.validateUser(dto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(hashingService.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password_hash,
      );
    });

    it('Should throw UnauthorizedException exception if user is not found', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.compare).not.toHaveBeenCalled();
    });

    it('Should throw UnauthorizedException exepction if password is wrong', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      jest.mocked(hashingService.compare).mockResolvedValue(false);

      await expect(authService.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password_hash,
      );
    });
  });

  describe('login', () => {
    const mockUser = getMockUser();

    it('Should return access token and user data if login success', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      jest.mocked(hashingService.compare).mockResolvedValue(true);
      jest.mocked(jwtService.sign).mockReturnValue('fakeJwtToken');

      const result = await authService.login(dto);

      expect(result).toEqual({
        accessToken: 'fakeJwtToken',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('Should throw UnauthorizedException if validation fails', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
