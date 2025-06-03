import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; // <-- Add this import

describe('Auth (e2e)', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;
  //let authController: AuthController;

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
    //authController = module.get<AuthController>(AuthController);
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
      expect(result).toMatchObject({ username: 'testuser', role: 'user' });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw if username exists', async () => {
      usersService.findOne!.mockResolvedValue({ username: 'testuser' });
      await expect(
        authService.register('testuser', 'password123'),
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      usersService.findOne!.mockResolvedValue({
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      });

      const result = await authService.validateUser('testuser', 'password123');
      expect(result).toMatchObject({ username: 'testuser', role: 'user' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if credentials are invalid', async () => {
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);
      usersService.findOne!.mockResolvedValue({
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
        username: 'testuser',
        password: 'hashed',
        role: 'user',
      };
      const result = authService.login(user);
      expect(result).toEqual({ access_token: 'mocked.jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'user123',
        role: 'user',
      });
    });
  });

  /*  describe('AuthController', () => {
      it('should call register via controller', async () => {
        const dto = { username: 'testuser', password: 'password123' };
        jest
          .spyOn(authService, 'register')
          .mockResolvedValue({ username: 'testuser', role: 'user' });
        const result = await authController.register(dto as any);
        expect(result).toEqual({ username: 'testuser', role: 'user' });
      });
  
      it('should call login via controller', async () => {
        const req = {
          user: { _doc: { _id: 'user123', username: 'testuser', role: 'user' } },
        };
        jest
          .spyOn(authService, 'login')
          .mockResolvedValue({ access_token: 'mocked.jwt.token' });
        const result = await authController.login(req as any, {
          username: 'testuser',
          password: 'password123',
        });
        expect(result).toEqual({ access_token: 'mocked.jwt.token' });
      });
    });*/
});
