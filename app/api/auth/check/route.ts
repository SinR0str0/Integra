import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const userData = cookieStore.get('user_data')?.value;
  
  if (!token || !userData) {
    return NextResponse.json({ ok: 'NO', msg: 'No autenticado' }, { status: 401 });
  }
  
  try {
    const user = JSON.parse(userData);
    return NextResponse.json({ ok: 'SI', user });
  } catch (error) {
    return NextResponse.json({ ok: 'NO', msg: 'Error de sesión' }, { status: 401 });
  }
}