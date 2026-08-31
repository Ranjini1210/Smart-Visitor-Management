import React from 'react';
import { QRScannerComponent } from '../components/QRScannerComponent';

export const QRScannerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-extrabold text-slate-900">Scan Visitor QR Pass</h2>
        <p className="text-xs text-slate-500">Scan digital QR code pass or enter token manually for instant verification</p>
      </div>

      <QRScannerComponent />
    </div>
  );
};
