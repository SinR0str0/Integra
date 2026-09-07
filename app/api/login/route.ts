// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { validateCaptcha } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Verificar que la URL de la API exista
    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;
    if (!apiUrl) {
      console.error('Falta la variable de entorno GOOGLE_SHEETS_API_URL');
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { user, pass, captcha } = body;

    // 2. Validar CAPTCHA
    const cookieStore = await cookies(); // Correcto para Next.js 15
    const expectedCaptcha = cookieStore.get('captcha_text')?.value;

    if (!expectedCaptcha) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'CAPTCHA expirado o no generado. Por favor, recarga la página.' 
      }, { status: 400 });
    }

    if (!validateCaptcha(captcha, expectedCaptcha)) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Código CAPTCHA incorrecto.' 
      }, { status: 400 });
    }

    // Limpiar el CAPTCHA después de usarlo (evita reutilización)
    cookieStore.delete('captcha_text');

    // 3. Validaciones básicas
    if (!user || !pass) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Usuario y contraseña son obligatorios.' 
      }, { status: 400 });
    }

    // 4. Llamada a Google Sheets API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        usuario: user,
        contrasena: pass
      })
    });

    // 5. Manejo seguro de la respuesta
    if (!response.ok) {
      throw new Error(`Error en la API de Google Sheets: ${response.status}`);
    };
    const data = await response.json();
    if (data.success) {
      return NextResponse.json({ 
        ok: 'SI', 
        ruta: 'dashboard', // O la ruta que maneje tu app
        user: data.user,
        token: data.token
      });
    } else {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: data.message || 'Usuario o contraseña incorrecto' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Error interno del servidor. Intente de nuevo más tarde.' 
    }, { status: 500 });
  }
}