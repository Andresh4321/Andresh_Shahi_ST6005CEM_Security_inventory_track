import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generateMfaSecret(email: string) {
    const secret = speakeasy.generateSecret({
        name: `InventoryTrack (${email})`,
        issuer: 'InventoryTrack'
    });
    return secret;
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl);
}

export function verifyMfaToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 step drift (60 seconds each direction) for clock skew
    });
}
