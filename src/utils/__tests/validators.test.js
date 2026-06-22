import { describe, it, expect } from 'vitest';
import {
  PHONE_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  validatePhone,
  validateEmail,
  validatePassword,
} from '../validators';

describe('validators', () => {
  describe('Phone number validation', () => {
    it('should validate valid Kenyan phone numbers', () => {
      expect(PHONE_REGEX.test('0712345678')).toBe(true);
      expect(PHONE_REGEX.test('0112345678')).toBe(true);
      expect(PHONE_REGEX.test('+254712345678')).toBe(true);
      expect(PHONE_REGEX.test('+254112345678')).toBe(true);
      expect(PHONE_REGEX.test('254712345678')).toBe(true);
      expect(PHONE_REGEX.test('254112345678')).toBe(true);

      expect(validatePhone('0712345678')).toBe(true);
    });

    it('should invalidate invalid phone numbers', () => {
      expect(PHONE_REGEX.test('12345')).toBe(false);
      expect(PHONE_REGEX.test('071234567')).toBe(false); // too short
      expect(PHONE_REGEX.test('07123456789')).toBe(false); // too long
      expect(PHONE_REGEX.test('0812345678')).toBe(false); // wrong prefix (only 7 or 1)
      expect(PHONE_REGEX.test('+254612345678')).toBe(false);

      expect(validatePhone(null)).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('Email validation', () => {
    it('should validate correct email formats', () => {
      expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
      expect(EMAIL_REGEX.test('jane.doe@saccobridge.co.ke')).toBe(true);
      expect(EMAIL_REGEX.test('user+label@domain.com')).toBe(true);

      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should invalidate incorrect email formats', () => {
      expect(EMAIL_REGEX.test('testexample.com')).toBe(false);
      expect(EMAIL_REGEX.test('test@')).toBe(false);
      expect(EMAIL_REGEX.test('@domain.com')).toBe(false);
      
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should validate secure passwords', () => {
      expect(validatePassword('SecureP@ss123')).toBe(true);
      expect(validatePassword('KenyanSacc0Bridge!')).toBe(true);
    });

    it('should invalidate passwords that fail safety rules', () => {
      // Less than 12 characters
      expect(validatePassword('P@ss123')).toBe(false);
      
      // No uppercase
      expect(validatePassword('securep@ss123')).toBe(false);

      // No lowercase
      expect(validatePassword('SECUREP@SS123')).toBe(false);

      // No number
      expect(validatePassword('SecureP@ssword')).toBe(false);

      // No special character
      expect(validatePassword('SecurePassword123')).toBe(false);

      expect(validatePassword(null)).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });
});
