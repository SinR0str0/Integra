// app/api/encuesta-data/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userData = cookieStore.get('user_data')?.value;
  
  if (!userData) {
    return NextResponse.json({ ok: 'NO', msg: 'No autenticado' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userData);
    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;

    if (!apiUrl) {
      return NextResponse.json({ ok: 'NO', msg: 'API no configurada' }, { status: 500 });
    }

    // Usamos la nueva acción 'obtener-encuesta'
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'obtener-encuesta');
    url.searchParams.append('cuenta_unam', user.cuenta_unam);

    const response = await fetch(url.toString(), { method: 'GET' });
    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ ok: 'NO', msg: data.message }, { status: 404 });
    }

    return NextResponse.json({ ok: 'SI', data });

  } catch (error) {
    console.error('Error GET encuesta-data:', error);
    return NextResponse.json({ ok: 'NO', msg: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const userData = cookieStore.get('user_data')?.value;
  
  if (!userData) {
    return NextResponse.json({ ok: 'NO', msg: 'No autenticado' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userData);
    const body = await request.json();
    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;

    if (!apiUrl) {
      return NextResponse.json({ ok: 'NO', msg: 'API no configurada' }, { status: 500 });
    }

    // Usamos la acción 'actualizar-encuesta' y pasamos los datos anidados
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'actualizar-encuesta',
        cuenta_unam: user.cuenta_unam,
        datos: body.datos // Aquí va todo el objeto formData de Next.js
      })
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ ok: 'NO', msg: data.message }, { status: 400 });
    }

    return NextResponse.json({ ok: 'SI', data });

  } catch (error) {
    console.error('Error POST encuesta-data:', error);
    return NextResponse.json({ ok: 'NO', msg: 'Error interno' }, { status: 500 });
  }
}