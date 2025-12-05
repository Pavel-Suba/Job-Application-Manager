# Firebase Deployment Návod

Aplikace je připravena k nasazení! Build byl úspěšně vytvořen.

## Problém s autentizací

Firebase CLI vyžaduje interaktivní přihlášení přes prohlížeč. Vzhledem k tomu, že běžíme v prostředí Antigravity, budete se muset přihlásit ručně.

## Postup nasazení

### Možnost 1: Přihlášení přes terminál (DOPORUČENO)

1. Otevřete **samostatný PowerShell nebo CMD terminál** (ne ten v Antigravity)
2. Přejděte do složky projektu:
   ```
   cd "C:\Users\pavel\.gemini\antigravity\playground\Job Application Manager"
   ```
3. Přihlaste se do Firebase:
   ```
   firebase login
   ```
4. Otevře se prohlížeč - přihlaste se svým Google účtem
5. Po úspěšném přihlášení nasaďte aplikaci:
   ```
   firebase deploy
   ```
6. Počkejte na dokončení (10-30 sekund)
7. Firebase vám zobrazí URL, kde je aplikace dostupná!

### Možnost 2: Použití CI tokenu (pokročilé)

1. Vygenerujte CI token:
   ```
   firebase login:ci
   ```
2. Zkopírujte token
3. Použijte token pro deployment:
   ```
   set FIREBASE_TOKEN=váš_token
   firebase deploy --token %FIREBASE_TOKEN%
   ```

## Po nasazení

Aplikace bude dostupná na:
- **Hlavní URL**: https://job-application-manager-236f4.web.app
- **Alternativní**: https://job-application-manager-236f4.firebaseapp.com

## Co dělat s Gemini API klíčem

⚠️ **DŮLEŽITÉ**: Před nasazením na production zkontrolujte `.env` soubory:
- `.env.local` - lokální development (nemá se nahrát)
- `.env` nebo `.env.production` - pro production

Ujistěte se, že Gemini API klíč je v `.env.local` a tento soubor je v `.gitignore`.

## Vlastní doména (volitelné - později)

Pokud si později koupíte vlastní doménu:
1. V [Firebase Console](https://console.firebase.google.com/project/job-application-manager-236f4/hosting/sites)
2. Hosting → Add custom domain
3. Následujte instrukce pro DNS nastavení

## Potřebujete pomoc?

Pokud nasazení nefunguje, dejte mi vědět:
- Jakou chybovou hlášku vidíte?
- Byl build úspěšný? (✓ ano)
- Přihlásili jste se úspěšně do Firebase?
