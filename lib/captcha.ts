// lib/captcha.ts

export interface CaptchaData {
  text: string;
  svg: string;
}

export function generateCaptcha(): CaptchaData {
  // Generar texto aleatorio de 6 caracteres (mayúsculas y números)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
  let text = '';
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Generar colores aleatorios
  const bgColor = `rgb(${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 50 + 200)}, ${Math.floor(Math.random() * 50 + 200)})`;
  const textColor = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;

  // Generar líneas de ruido
  let lines = '';
  for (let i = 0; i < 5; i++) {
    const x1 = Math.floor(Math.random() * 200);
    const y1 = Math.floor(Math.random() * 60);
    const x2 = Math.floor(Math.random() * 200);
    const y2 = Math.floor(Math.random() * 60);
    const color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
  }

  // Generar SVG con distorsión
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
      <rect width="200" height="60" fill="${bgColor}"/>
      ${lines}
      <text 
        x="100" 
        y="40" 
        font-family="Arial, sans-serif" 
        font-size="28" 
        font-weight="bold" 
        fill="${textColor}" 
        text-anchor="middle"
        transform="rotate(${Math.floor(Math.random() * 10 - 5)} 100 30)"
        letter-spacing="5"
      >
        ${text}
      </text>
    </svg>
  `;

  return { text, svg };
}

export function validateCaptcha(userInput: string, expectedText: string): boolean {
  return userInput.toUpperCase().trim() === expectedText.toUpperCase().trim();
}