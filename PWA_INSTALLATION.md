# Guida Installazione PWA FIT App

## Prerequisiti per l'installazione

Per rendere l'app installabile come PWA, sono necessari:

1. ✅ **Manifest JSON configurato** - In `public/manifest.json`
2. ✅ **Service Worker registrato** - In `public/sw.js` e registrato in `src/main.tsx`
3. ✅ **Meta tag PWA** - In `index.html`
4. ✅ **Icone in tutte le dimensioni** - Da creare in `public/icons/`
5. ✅ **HTTPS** - Vercel fornisce HTTPS automaticamente

## Passaggi per l'installazione

### 1. Genera le icone mancanti

L'app ha bisogno di icone in queste dimensioni:
- 72x72, 96x96, 144x144, 152x152, 192x192, 384x384, 512x512

#### Metodo 1: Online (consigliato)
1. Vai su https://favicon.io/favicon-generator/
2. Carica il file `public/icons/icon.svg`
3. Scarica il pacchetto completo
4. Estrai i file nella cartella `public/icons/`

#### Metodo 2: Convertitore manuale
1. Vai su https://convertio.co/it/svg-png/
2. Carica `public/icons/icon.svg`
3. Converti in tutte le dimensioni richieste
4. Salva i file in `public/icons/`

### 2. Test su dispositivo mobile

L'installazione PWA funziona solo su dispositivi mobile:

#### Android (Chrome):
1. Apri l'app su Vercel
2. Dovresti vedere un banner di installazione in basso
3. Clicca "Installa" o il simbolo ⋮ → "Installa app"

#### iOS (Safari):
1. Apri l'app su Vercel
2. Clicca il simbolo di condivisione (quadrato con freccia su)
3. Scorri verso il basso e clicca "Aggiungi alla Home"

### 3. Verifica dell'installazione

Dopo l'installazione, l'app dovrebbe:
- Avere un'icona sulla home screen
- Aprirsi in modalità fullscreen (senza barra degli indirizzi)
- Funzionare offline (grazie al service worker)
- Essere elencata nelle app installate

## Risoluzione problemi

### Se non compare il banner di installazione:
1. **Verifica HTTPS**: L'app deve essere servita tramite HTTPS
2. **Controlla le icone**: Tutte le dimensioni devono essere presenti
3. **Testa su Chrome DevTools**:
   - F12 → Application → Manifest
   - Verifica che non ci siano errori
4. **Installa manualmente**:
   - Chrome: ⋮ → "Installa app"
   - Safari: Condividi → "Aggiungi alla Home"

### Se l'app non funziona offline:
1. Verifica che il service worker sia registrato
2. Controlla la console per errori
3. Prova a ricaricare la pagina

## File PWA creati

- `public/manifest.json` - Configurazione PWA
- `public/sw.js` - Service Worker per offline
- `public/icons/icon.svg` - Icona vettoriale
- `public/icons/` - Cartella per le icone PNG
- `src/main.tsx` - Registrazione service worker
- `index.html` - Meta tag PWA

## Funzionalità PWA incluse

- ✅ Installazione su home screen
- ✅ Funzionamento offline
- ✅ Cache delle risorse
- ✅ Notifiche push (pronto per implementare)
- ✅ Sincronizzazione dati (pronto per implementare)
- ✅ Icone adattive
- ✅ Tema colorato coerente

Dopo aver generato le icone e testato su mobile, l'app sarà completamente installabile come app nativa! 🚀