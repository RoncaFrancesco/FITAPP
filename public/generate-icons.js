// Script per generare le icone PWA
const fs = require('fs');
const path = require('path');

// SVG content per l'icona
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="256" fill="#8b5cf6"/>
  <g transform="translate(256, 256)">
    <rect x="-180" y="-15" width="40" height="30" rx="5" fill="#ffffff"/>
    <rect x="-170" y="-25" width="20" height="50" rx="3" fill="#ffffff"/>
    <rect x="-150" y="-8" width="300" height="16" rx="8" fill="#ffffff"/>
    <rect x="140" y="-15" width="40" height="30" rx="5" fill="#ffffff"/>
    <rect x="150" y="-25" width="20" height="50" rx="3" fill="#ffffff"/>
  </g>
  <text x="256" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">FIT</text>
</svg>`;

// Crea la cartella icons se non esiste
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Scrivi il file SVG
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

// Funzione per creare un semplice PNG placeholder (base64 encoded)
function createPlaceholderPNG(size) {
  // Questo è un placeholder molto basilare - in produzione dovresti usare strumenti come ImageMagick
  const colors = {
    bg: '#8b5cf6',
    text: '#ffffff'
  };

  // Creiamo un file HTML temporaneo che genera l'icona
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; background: ${colors.bg}; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="canvas" width="${size}" height="${size}"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '${colors.bg}';
        ctx.fillRect(0, 0, ${size}, ${size});

        // Circle
        ctx.fillStyle = '${colors.bg}';
        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, ${size/2}, 0, 2 * Math.PI);
        ctx.fill();

        // FIT text
        ctx.fillStyle = '${colors.text}';
        ctx.font = 'bold ${size * 0.2}px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FIT', ${size/2}, ${size * 0.7});

        // Simple dumbbell representation
        ctx.fillStyle = '${colors.text}';
        const barWidth = ${size * 0.4};
        const barHeight = ${size * 0.03};
        const weightSize = ${size * 0.08};

        // Bar
        ctx.fillRect(${size/2 - barWidth/2}, ${size/2 - barHeight/2}, barWidth, barHeight);

        // Left weight
        ctx.fillRect(${size/2 - barWidth/2 - weightSize}, ${size/2 - weightSize/2}, weightSize, weightSize);

        // Right weight
        ctx.fillRect(${size/2 + barWidth/2}, ${size/2 - weightSize/2}, weightSize, weightSize);
    </script>
</body>
</html>`;

  return htmlContent;
}

// Genera i file HTML per creare le icone (dovrai convertirli manualmente o con uno strumento online)
const sizes = [72, 96, 144, 152, 192, 384, 512];

console.log('Icona SVG generata con successo!');
console.log('\nPer generare le icone PNG, hai due opzioni:');
console.log('\n1. Usa uno strumento online:');
console.log('   - Vai su https://favicon.io/favicon-generator/');
console.log('   - Carica il file SVG generato in public/icons/icon.svg');
console.log('   - Scarica il pacchetto completo di icone');
console.log('\n2. Usa ImageMagick (se installato):');
sizes.forEach(size => {
  console.log(`   convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png`);
});

console.log('\nFile creati:');
console.log('- public/icons/icon.svg (icona vettoriale)');
console.log('- public/icons/icon-192x192.png (placeholder esistente)');
console.log('- public/icons/icon-512x512.png (placeholder esistente)');

console.log('\nPer rendere l\'app installabile, assicurati di:');
console.log('1. Avere tutte le icone nelle dimensioni richieste');
console.log('2. Servire l\'app tramite HTTPS (richiesto per i service worker)');
console.log('3. Testare l\'app su un dispositivo mobile');