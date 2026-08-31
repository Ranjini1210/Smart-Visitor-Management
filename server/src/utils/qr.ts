import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateQRToken(visitId: number): string {
  const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `SVM-${visitId}-${randomBytes}`;
}

export async function generateQRDataURL(token: string): Promise<string> {
  try {
    const payload = JSON.stringify({
      token,
      system: 'Smart Visitor Management',
      verifiable: true
    });
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0284C7', // Sky Blue primary accent
        light: '#FFFFFF'
      },
      width: 300,
      margin: 2
    });
  } catch (error) {
    console.error('Error generating QR code data URL', error);
    throw new Error('Failed to generate QR code visual');
  }
}
