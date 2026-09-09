import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: 'SI', msg: 'Sesión cerrada' });
  
  response.cookies.delete('auth_token');
  response.cookies.delete('last_activity');
  response.cookies.delete('user_data');
  
  return response;
}