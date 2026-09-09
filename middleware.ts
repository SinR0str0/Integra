import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const lastActivity = request.cookies.get('last_activity')?.value;
  
  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ['/estudiantes'];
  
  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Verificar timeout de 10 minutos (600000 ms)
    if (lastActivity) {
      const lastActivityTime = parseInt(lastActivity);
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTime;
      
      if (timeSinceLastActivity > 600000) { // 10 minutos
        // Sesión expirada - eliminar cookies y redirigir
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete('auth_token');
        response.cookies.delete('last_activity');
        response.cookies.delete('user_data');
        return response;
      }
    }
    
    // Actualizar timestamp de última actividad
    const response = NextResponse.next();
    response.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 600, // 10 minutos
      path: '/',
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/estudiantes/:path*'],
};