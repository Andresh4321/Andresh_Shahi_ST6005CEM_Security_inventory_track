import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '../config';

export function encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Encrypt specific fields of an object
export function encryptFields(obj: any, fields: string[]): any {
    const encrypted = { ...obj };
    fields.forEach(field => {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
            encrypted[field] = encryptData(encrypted[field]);
        }
    });
    return encrypted;
}

// Decrypt specific fields of an object
export function decryptFields(obj: any, fields: string[]): any {
    const decrypted = { ...obj };
    fields.forEach(field => {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
            try {
                decrypted[field] = decryptData(decrypted[field]);
            } catch (e) {
                // Field might not be encrypted (legacy data)
            }
        }
    });
    return decrypted;
}
