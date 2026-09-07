import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Integra 2026 - DGOAE',
  description: 'Sistema Integra - Dirección General de Orientación y Atención Educativa UNAM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" 
        />
      </head>
      <body>{children}</body>
    </html>
  );
}