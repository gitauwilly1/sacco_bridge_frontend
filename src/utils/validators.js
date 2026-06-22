export const PHONE_REGEX = /^(?:\+?254|0)?[17]\d{8}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/,
};

export function validatePhone(phone) {
  if (!phone) return false;
  return PHONE_REGEX.test(phone);
}

export function validateEmail(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password) {
  if (!password) return false;
  return (
    password.length >= 12 &&
    PASSWORD_REGEX.uppercase.test(password) &&
    PASSWORD_REGEX.lowercase.test(password) &&
    PASSWORD_REGEX.number.test(password) &&
    PASSWORD_REGEX.special.test(password)
  );
}
