// app/api/convocatorias/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userData = cookieStore.get('user_data')?.value;
  
  // Verificar autenticación (aunque las convocatorias son públicas, 
  // mantenemos la consistencia con las demás APIs)
  if (!userData) {
    return NextResponse.json({ ok: 'NO', msg: 'No autenticado' }, { status: 401 });
  }
  
  try {
    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;
    
    if (!apiUrl) {
      return NextResponse.json({ ok: 'NO', msg: 'API de Google Sheets no configurada' }, { status: 500 });
    }
    
    // Construir URL con la acción para obtener convocatorias
    const url = new URL(apiUrl);
    url.searchParams.append('action', 'obtener-convocatorias');
    
    const response = await fetch(url.toString(), { method: 'GET' });
    
    // Verificar que la respuesta sea JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textError = await response.text();
      console.error('Google Apps Script devolvió HTML:', textError.substring(0, 300));
      return NextResponse.json({ 
        ok: 'NO', 
        msg: 'Error en Google Sheets: La API devolvió HTML en lugar de JSON' 
      }, { status: 502 });
    }
    
    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ ok: 'NO', msg: data.message }, { status: 400 });
    }
    
    return NextResponse.json({ ok: 'SI', data: data.data });
    
  } catch (error) {
    console.error('Error en API convocatorias:', error);
    return NextResponse.json({ ok: 'NO', msg: 'Error interno del servidor' }, { status: 500 });
  }
}