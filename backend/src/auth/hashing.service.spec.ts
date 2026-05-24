import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';
import bcrypt from 'bcrypt';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashingService],
    }).compile();

    service = module.get<HashingService>(HashingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compare', () => {
    const data = 'plainPassword';
    const encrypted = 'hashedPassword';

    let compareSpy: jest.SpyInstance;

    beforeEach(() => {
      compareSpy = jest.spyOn(bcrypt, 'compare');
    });

    it('should return true if data matches encrypted string', async () => {
      compareSpy.mockImplementation(async () => true);

      const result = await service.compare(data, encrypted);

      expect(result).toBe(true);
      expect(compareSpy).toHaveBeenCalledWith(data, encrypted);
    });

    it('should return false if data NOT match encrypted string', async () => {
      compareSpy.mockImplementation(async () => false);

      const result = await service.compare(data, encrypted);

      expect(result).toBe(false);
      expect(compareSpy).toHaveBeenCalledWith(data, encrypted);
    });

    it('should throw an error if bcrypt.compare fails', async () => {
      const expectedError = new Error('Bcrypt internal error');

      compareSpy.mockImplementation(() => Promise.reject(expectedError));

      await expect(service.compare(data, encrypted)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
