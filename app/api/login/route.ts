// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { validateCaptcha } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user, pass, captcha, valida, sesionew } = body;

    // Validar CAPTCHA
    const cookieStore = await cookies();
    const expectedCaptcha = cookieStore.get('captcha_text')?.value;

    if (!expectedCaptcha) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'CAPTCHA expirado.' 
      }, { status: 400 });
    }

    if (!validateCaptcha(captcha, expectedCaptcha)) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'CAPTCHA incorrecto.' 
      }, { status: 400 });
    }

    // Limpiar el CAPTCHA después de usarlo (evita reutilización)
    cookieStore.delete('captcha_text');

    // Validaciones básicas
    if (!user || !pass) {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Todos los campos son obligatorios' 
      }, { status: 400 });
    }

    // Aquí va tu lógica de autenticación real
    // Ejemplo simulado:
    if (user === 'ADMIN' && pass === '1234') {
      return NextResponse.json({ 
        ok: 'SI', 
        check: 1, 
        ruta: 'dashboard-admin' 
      });
    }
    
    if (user === 'ALUMNO' && pass === '1234') {
      if (sesionew === 0) {
        return NextResponse.json({ 
          ok: 'NO', 
          msg: 'SesionActiva', 
          ultsession: '05/03/2018 01:16:31 p.m.' 
        });
      }
      return NextResponse.json({ 
        ok: 'SI', 
        check: 0, 
        ruta: 'dashboard-alumno' 
      });
    }

    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Usuario o contraseña incorrectos' 
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ 
      ok: 'NO', 
      msg: 'Error interno del servidor' 
    }, { status: 500 });
  }
}