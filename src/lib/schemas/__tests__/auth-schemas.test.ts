import { 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema, 
  updatePasswordSchema 
} from '../auth-schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        rememberMe: true
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.email?._errors).toBeDefined();
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345', // Too short
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123', // No uppercase
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123', // No lowercase
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });

    it('should reject password without numbers', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PasswordABC', // No numbers
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid reset password data', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.email?._errors).toBeDefined();
      }
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate valid update password data', () => {
      const validData = {
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      const result = updatePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'Password123',
        confirmPassword: 'Password456', // Different password
      };

      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.confirmPassword?._errors).toBeDefined();
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        password: 'password', // Missing uppercase and numbers
        confirmPassword: 'password',
      };

      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });
  });
}); 