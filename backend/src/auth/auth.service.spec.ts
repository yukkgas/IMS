import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from './hashing.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { LoginResponseDto } from './dto/login-response.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let hashingService: HashingService;

  const mockPrismaService = { user: { findUnique: jest.fn() } };
  const mockJwtService = { sign: jest.fn() };
  const mockHashingService = { compare: jest.fn() };

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

  const mockUser = getMockUser();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    hashingService = module.get<HashingService>(HashingService);

    jest.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    jest.mocked(hashingService.compare).mockResolvedValue(true);
    jest.mocked(jwtService.sign).mockReturnValue('fakeJwtToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('Should return user if provided credentials are valid', async () => {
      const result = await service.validateUser(dto);

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

      await expect(service.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.compare).not.toHaveBeenCalled();
    });

    it('Should throw UnauthorizedException exepction if password is wrong', async () => {
      jest.mocked(hashingService.compare).mockResolvedValue(false);

      await expect(service.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password_hash,
      );
    });
  });

  describe('login', () => {
    it('Should return access token and user data if login success', async () => {
      const result = await service.login(dto);

      const expectedResponse: LoginResponseDto = {
        accessToken: 'fakeJwtToken',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
      };

      expect(result).toEqual(expectedResponse);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('Should throw UnauthorizedException if validation fails', async () => {
      jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
