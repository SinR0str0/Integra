// app/api/captcha/route.ts

import { NextResponse } from 'next/server';
import { generateCaptcha } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function GET() {
  const { text, svg } = generateCaptcha();

  // Almacenar el texto del CAPTCHA en una cookie httpOnly (segura)
  const cookieStore = await cookies();
  cookieStore.set('captcha_text', text, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300, // 5 minutos de validez
    path: '/',
  });

  // Retornar el SVG como imagen
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}