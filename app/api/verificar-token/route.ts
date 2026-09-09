import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verificar-token',
        token: token
      })
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ 
        ok: 'SI', 
        msg: 'Token válido',
        cuenta_unam: data.cuenta_unam
      });
    } else {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: data.message || 'Token inválido o expirado' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error al verificar token:', error);
    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Error interno del servidor' 
    }, { status: 500 });
  }
}