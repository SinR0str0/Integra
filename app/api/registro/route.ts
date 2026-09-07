import { NextResponse } from 'next/server';
import { validateCaptcha } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cuenta, correo, contrasena, curp, captcha } = body;

    // Validar CAPTCHA
    const cookieStore = await cookies();
    const expectedCaptcha = cookieStore.get('captcha_text')?.value;

    if (!expectedCaptcha) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'CAPTCHA expirado. Por favor, genere uno nuevo.',
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
    if (!cuenta || cuenta.length !== 9) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'El número de cuenta debe tener 9 dígitos.',
      }, { status: 400 });
    }

    if (!correo || !correo.includes('@')) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'Ingrese un correo electrónico válido.',
      }, { status: 400 });
    }

    if (!contrasena || contrasena.length < 6) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'La contraseña debe tener al menos 6 caracteres.',
      }, { status: 400 });
    }

    if (!curp || curp.length !== 18) {
      return NextResponse.json({
        ok: 'NO',
        msg: 'El CURP debe tener 18 caracteres.',
      }, { status: 400 });
    }

    // Aquí va tu lógica de registro real en la base de datos
    // Ejemplo: await db.usuario.create({ cuenta, correo, contrasenaHash, curp })
    const response = await fetch(process.env.GOOGLE_SHEETS_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'registro',
        cuenta_unam: cuenta,
        correo: correo,
        contrasena: contrasena,
        curp: curp
      })
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ ok: 'SI', msg: 'Registro exitoso' });
    } else {
      return NextResponse.json({ 
        ok: 'NO', 
        msg: data.message || 'Error en el registro' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({
      ok: 'NO',
      msg: 'Error interno del servidor.',
    }, { status: 500 });
  }
}