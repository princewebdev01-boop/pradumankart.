export const SITE_CONFIG = {
  name: 'PRADUMANKART',
  upi: {
    id: '915532vny@ybl',
    name: 'PRADUMANKART',
    // Generates a simple QR code using a public API for demo purposes
    qrTemplate: (amount: number, name: string) => `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=915532vny@ybl&pn=PRADUMANKART&am=${amount}&tn=Order for ${name}`)}`
  },
  support: {
    phone: '+91 9155328308',
    email: 'princewebdev01@gmail.com'
  }
};
