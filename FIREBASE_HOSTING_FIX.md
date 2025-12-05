# Firebase Hosting - Řešení problémů

## Problém: "Assertion failed: resolving hosting target"

Tato chyba znamená, že Firebase Hosting site ještě nebyl vytvořen v Firebase Console.

## Řešení

### Krok 1: Re-autentizace

V terminálu spusťte:
```powershell
firebase login --reauth
```

Otevře se prohlížeč - přihlaste se znovu svým Google účtem.

### Krok 2: Inicializace Hosting

Máte dvě možnosti:

#### A) Přes Firebase CLI (DOPORUČENO)

```powershell
firebase init hosting
```

Při dotazech:
- **"What do you want to use as your public directory?"** → `dist`
- **"Configure as a single-page app?"** → `Yes` (y)
- **"Set up automatic builds and deploys with GitHub?"** → `No` (n)
- **"File dist/index.html already exists. Overwrite?"** → `No` (n)

Pak nasaďte:
```powershell
firebase deploy --only hosting
```

#### B) Přes Firebase Console (alternativa)

1. Otevřete [Firebase Console](https://console.firebase.google.com/project/job-application-manager-236f4/hosting/sites)
2. Přejděte na **Hosting**
3. Klikněte na **Get Started** nebo **Add site**
4. Vytvořte site (použijte výchozí název)
5. Pak v terminálu:
```powershell
firebase deploy --only hosting
```

### Krok 3: Ověření

Po úspěšném deployment uvidíte:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/job-application-manager-236f4/overview
Hosting URL: https://job-application-manager-236f4.web.app
```

## Alternativní řešení: Použití CI tokenu

Pokud ani re-autentizace nefunguje:

1. Vygenerujte CI token:
```powershell
firebase login:ci
```

2. Zkopírujte token a použijte ho:
```powershell
firebase deploy --token YOUR_TOKEN_HERE
```

## Kontrola, zda hosting existuje

Zkontrolujte v [Firebase Console → Hosting](https://console.firebase.google.com/project/job-application-manager-236f4/hosting/sites), zda existuje nějaký hosting site.

Pokud tam nic není, určitě musíte spustit `firebase init hosting`.
