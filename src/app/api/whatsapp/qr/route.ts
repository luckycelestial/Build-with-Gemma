import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ success: false, error: 'No QR text provided' }, { status: 400 });
    }
    const dataUrl = await QRCode.toDataURL(text, { margin: 2, width: 300 });
    return NextResponse.json({ success: true, dataUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
