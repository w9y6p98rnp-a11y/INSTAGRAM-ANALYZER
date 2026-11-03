# Instagram Analyzer v3 — Automatico

Questa versione prepara l'architettura corretta per un collegamento Instagram automatico tramite OAuth ufficiale.

## Cosa contiene

- `index.html` — interfaccia GitHub Pages
- `config.js` — URL del backend
- `worker.js` — backend Cloudflare Worker per OAuth
- `README.md` — istruzioni

## Importante

Instagram non deve essere collegato inserendo la password dentro questa app.

La versione corrente dell'API Instagram con Instagram Login è destinata agli account professionali (Creator/Business). Il flusso usa `https://www.instagram.com/oauth/authorize` e il backend conserva il client secret fuori dal repository pubblico.

Il vecchio Instagram Basic Display API per account personali non è una soluzione disponibile.

Inoltre, l'API ufficiale non fornisce una lista affidabile di:
- visitatori del profilo
- persone che ti hanno bloccato

E non bisogna inventare questi dati.

## Configurazione

1. Crea/configura l'app nel Meta Developer Dashboard.
2. Abilita Instagram API con Instagram Login.
3. Inserisci l'URL callback del Worker:
   `https://TUO-WORKER.workers.dev/auth/callback`
4. Nel Cloudflare Worker crea i secret:
   - `IG_CLIENT_ID`
   - `IG_CLIENT_SECRET`
5. Imposta la variabile `FRONTEND_URL` con:
   `https://w9y6p98rnp-a11y.github.io/INSTAGRAM-ANALYZER/`
6. Pubblica `worker.js`.
7. Modifica `config.js` e sostituisci `INSERISCI_QUI_URL_BACKEND` con l'URL del Worker.
8. Carica `index.html` e `config.js` nel repository GitHub Pages.

## Sicurezza

Non mettere mai `IG_CLIENT_SECRET` in `index.html`, `config.js` o in un repository pubblico.

## Stato

Questa v3 realizza il collegamento OAuth e la lettura del profilo professionale. La parte "chi segui/non ti segue" può essere aggiunta solo dove l'API ufficiale espone realmente quei dati; non usa scraping o password.
