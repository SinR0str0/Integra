import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, nueva_contrasena } = body;

    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Validaciones básicas
    if (!token) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Token no proporcionado' 
      }, { status: 400 });
    }

    if (!nueva_contrasena || nueva_contrasena.length < 6) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'La contraseña debe tener al menos 6 caracteres' 
      }, { status: 400 });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cambiar-password',
        token: token,
        nueva_contrasena: nueva_contrasena
      })
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ 
        ok: 'SI', 
        msg: 'Contraseña cambiada exitosamente' 
      });
    } else {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: data.message || 'Error al cambiar la contraseña' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Error interno del servidor' 
    }, { status: 500 });
  }
}