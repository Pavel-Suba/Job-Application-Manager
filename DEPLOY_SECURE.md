# 🚀 Nasazení zabezpečené aplikace

Build byl úspěšný! Nyní prosím nasaďte aplikaci na Firebase.

## Příkaz k nasazení:

```powershell
firebase deploy
```

## Co se změní po nasazení:

✅ **Pouze tyto emaily budou mít přístup:**
- pavel@cecinafrica.com
- pav.suba@gmail.com

❌ **Kdokoliv jiný:**
- Uvidí chybovou hlášku
- Bude automaticky odhlášen

## Po nasazení doporučuji:

### 1. Testování
Zkuste se přihlásit s oběma povolenými emaily a ověřte, že funguje.

### 2. Nastavení Firestore Security Rules (DŮLEŽITÉ!)

Otevřete: https://console.firebase.google.com/project/job-application-manager-236f4/firestore/rules

Nahraďte pravidla tímto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Pouze whitelistované emaily
    match /{document=**} {
      allow read, write: if request.auth != null 
                         && request.auth.token.email in [
                           'pavel@cecinafrica.com',
                           'pav.suba@gmail.com'
                         ];
    }
  }
}
```

Klikněte **Publish**.

### 3. Nastavení Storage Security Rules (DŮLEŽITÉ!)

Otevřete: https://console.firebase.google.com/project/job-application-manager-236f4/storage/rules

Nahraďte pravidla tímto:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null
                         && request.auth.token.email in [
                           'pavel@cecinafrica.com',
                           'pav.suba@gmail.com'
                         ];
    }
  }
}
```

Klikněte **Publish**.

---

## Proč nastavit Security Rules?

Whitelist v kódu chrání **frontend** (uživatelské rozhraní).
Security Rules chrání **backend** (databázi a soubory).

**Obě vrstvy dohromady = maximální bezpečnost!** 🔒

Detailní návod najdete v souboru: `EMAIL_WHITELIST_GUIDE.md`
