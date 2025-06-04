import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';

describe('Auth (e2e)', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      usersService.findOne!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      });

      const result = await authService.register('testuser', 'password123');
      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
      expect(usersService.create).toHaveBeenCalledWith(
        'testuser',
        'password123',
      );
      expect(result).toMatchObject({ username: 'testuser', role: 'user', _id: 'user123' });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException if username exists', async () => {
      usersService.findOne!.mockResolvedValue({ username: 'testuser' });
      await expect(
        authService.register('testuser', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      usersService.findOne!.mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      });

      const result = await authService.validateUser('testuser', 'password123');
      expect(result).toMatchObject({ username: 'testuser', role: 'user', _id: 'user123' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if credentials are invalid', async () => {
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);
      usersService.findOne!.mockResolvedValue({
        _id: 'user123',
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      });

      const result = await authService.validateUser('testuser', 'wrongpass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', () => {
      const user = {
        _id: 'user123',
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      };
      const result = authService.login(user as any);
      expect(result).toEqual({ access_token: 'mocked.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user123',
        role: 'user',
      });
    });
  });
});
