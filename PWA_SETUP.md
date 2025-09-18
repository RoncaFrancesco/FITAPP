# Setup PWA per FIT App

## Installazione completata ✅

Ho configurato la tua app FIT come Progressive Web App (PWA) installabile su smartphone.

## Funzionalità PWA aggiunte:

### 1. **Manifest Web App** (`/public/manifest.json`)
- Nome app: "FIT - Allenamento Personale"
- Icona personalizzata
- Colori del tema (viola)
- Orientamento portrait
- Shortcut per accesso rapido

### 2. **Service Worker** (`/public/sw.js`)
- Funzionamento offline
- Cache delle risorse
- Notifiche push
- Sincronizzazione dati

### 3. **Meta Tag PWA** (in `index.html`)
- Supporto iOS Safari
- Supporto Windows Phone
- Meta tag social media
- Tema colorato

## Per testare l'installazione:

### 1. **Avvia il server di sviluppo**
```bash
npm run dev
```

### 2. **Installa l'app su smartphone**
1. Apri l'app nel browser Chrome su smartphone
2. Dovresti vedere un banner di installazione
3. Clicca "Installa" o il simbolo + nella barra degli indirizzi
4. Conferma l'installazione

### 3. **Alternative se non appare il banner**
- Chrome: Menu ⋮ → "Aggiungi alla schermata Home"
- Safari: Freccia condividi → "Aggiungi a Home"
- Firefox: Menu ⋮ → "Installa app"

## Icone da sostituire:

Le icone attuali sono placeholder. Per icone di qualità:

### Opzione 1: Strumenti online
1. Vai su https://favicon.io/favicon-generator/
2. Carica un'immagine o genera una favicon
3. Sostituisci i file nella cartella `/public/icons/`

### Opzione 2: Converti l'SVG esistente
1. Usa https://convertio.co/it/svg-png/
2. Converti `/public/icons/icon.svg` in PNG
3. Crea le dimensioni: 72x72, 96x96, 144x144, 192x192, 384x384, 512x512

### Opzione 3: Canva/Figma
1. Crea un design 512x512px
2. Esporta come PNG nelle diverse dimensioni
3. Sostituisci i file nella cartella icons

## File PWA creati:

- `/public/manifest.json` - Configurazione PWA
- `/public/sw.js` - Service Worker per offline
- `/public/icons/icon.svg` - Icona vettoriale
- `/public/icons/icon-192x192.png` - Icona 192px (placeholder)
- `/public/icons/icon-512x512.png` - Icona 512px (placeholder)
- `/public/generate-icons.js` - Script per generare icone
- Aggiornato `index.html` con meta tag PWA

## Funzionalità aggiuntive disponibili:

- **Notifiche push** per promemoria allenamenti
- **Sincronizzazione offline** per workout senza connessione
- **Badge sulla home** per notifiche non lette
- **Theme color** personalizzato per barra stato

L'app è ora pronta per essere installata come app nativa su smartphone! 🚀