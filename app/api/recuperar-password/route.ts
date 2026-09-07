import { NextResponse } from 'next/server';
import { validateCaptcha } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuario, captcha } = body;

    // Validar CAPTCHA
    const cookieStore = await cookies();
    const expectedCaptcha = cookieStore.get('captcha_text')?.value;

    if (!expectedCaptcha) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'CAPTCHA expirado. Por favor, recárguelo.',
      }, { status: 400 });
    }

    if (!validateCaptcha(captcha, expectedCaptcha)) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'Código CAPTCHA incorrecto.',
      }, { status: 400 });
    }

    // Limpiar CAPTCHA después de usarlo
    cookieStore.delete('captcha_text');

    // Validaciones básicas
    if (!usuario) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'Ingrese su número de cuenta UNAM.',
      }, { status: 400 });
    }

    const response = await fetch(process.env.GOOGLE_SHEETS_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'recuperar-password',
        usuario: usuario
      })
    });

    const data = await response.json();

    return NextResponse.json({ 
      ok: data.success ? 'SI' : 'NO', 
      msg: data.message 
    });

  } catch (error) {
    console.error('Error en recuperación:', error);
    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Error interno del servidor' 
    }, { status: 500 });
  }
}