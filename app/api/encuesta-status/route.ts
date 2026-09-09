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
    
    // Consultar Google Sheets para verificar estado actual
    const apiUrl = process.env.GOOGLE_SHEETS_API_URL;
    if (apiUrl) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-encuesta-status',
          cuenta_unam: user.cuenta_unam
        })
      });
      
      const data = await response.json();
      if (data.success) {
        return NextResponse.json({ 
          ok: 'SI', 
          encuesta_realizada: data.encuesta_realizada 
        });
      }
    }
    
    // Si no hay API, usar el dato local
    return NextResponse.json({ 
      ok: 'SI', 
      encuesta_realizada: user.encuesta_realizada || 'no' 
    });
    
  } catch (error) {
    return NextResponse.json({ ok: 'NO', msg: 'Error' }, { status: 500 });
  }
}