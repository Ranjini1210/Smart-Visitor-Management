import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateSecureQRToken(visitId: string, visitorId: string): string {
  const hash = crypto.createHash('sha256').update(`${visitId}-${visitorId}-${Date.now()}`).digest('hex').substring(0, 16);
  return `SVM-QR-${visitId.toUpperCase()}-${hash.toUpperCase()}`;
}

export async function generateQRCodeDataUrl(qrToken: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#0369a1', // Sky-Blue Enterprise primary accent
        light: '#ffffff'
      },
      width: 300
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR Code Data URL', error);
    return '';
  }
}
