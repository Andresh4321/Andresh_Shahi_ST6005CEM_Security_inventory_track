import { PASSWORD_EXPIRY_DAYS } from '../config';

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'fair' | 'strong' | 'very_strong';
}

export function validatePasswordStrength(password: string, username?: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length check (8-128)
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (password.length > 128) errors.push('Password must not exceed 128 characters');
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Uppercase check
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    else score++;

    // Lowercase check
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    else score++;

    // Number check
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    else score++;

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    } else {
        score++;
    }

    // Not same as username
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push('Password must not contain your username');
    }

    // Common passwords check
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common');
    }

    let strength: 'weak' | 'fair' | 'strong' | 'very_strong';
    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'fair';
    else if (score <= 5) strength = 'strong';
    else strength = 'very_strong';

    return {
        isValid: errors.length === 0,
        errors,
        strength
    };
}

export function isPasswordExpired(passwordCreatedAt: Date): boolean {
    const expiryDate = new Date(passwordCreatedAt);
    expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
    return new Date() > expiryDate;
}
