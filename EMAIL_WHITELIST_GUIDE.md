# 🔒 Email Whitelist - Zabezpečení Aplikace

## Co bylo implementováno

Aplikace nyní povoluje přístup **pouze těmto emailům**:
- ✅ `pavel@cecinafrica.com`
- ✅ `pav.suba@gmail.com`

Kdokoliv jiný, kdo se pokusí přihlásit, bude automaticky odhlášen a uvidí chybovou hlášku.

---

## Jak to funguje

1. Uživatel se přihlásí přes Google
2. Systém zkontroluje jeho email proti whitelistu
3. Pokud email **NENÍ** na seznamu:
   - Zobrazí se chyba: "Přístup odepřen. Email 'xxx@xxx.com' není autorizován."
   - Uživatel je automaticky odhlášen
4. Pokud email **JE** na seznamu:
   - Uživatel získá přístup k aplikaci

---

## Jak přidat/odebrat emaily (3 způsoby)

### Způsob 1: V kódu (DOPORUČENO)

**Soubor**: `src/context/AuthContext.jsx`

Najděte řádky 12-16:
```javascript
// Whitelist povolených emailů
const ALLOWED_EMAILS = [
    'pavel@cecinafrica.com',
    'pav.suba@gmail.com'
];
```

**Přidání emailu:**
```javascript
const ALLOWED_EMAILS = [
    'pavel@cecinafrica.com',
    'pav.suba@gmail.com',
    'novy.email@example.com'  // ← Přidejte nový email
];
```

**Odebrání emailu:**
Prostě smažte řádek s emailem, který nechcete povolit.

**Po změně:**
1. Uložte soubor
2. Spusťte: `npm run build`
3. Nasaďte: `firebase deploy`

---

### Způsob 2: Přes Firebase Firestore (pokročilé)

Můžete vytvořit kolekci `allowedUsers` ve Firestore a kontrolovat proti ní.

**Kroky:**
1. V [Firebase Console](https://console.firebase.google.com/project/job-application-manager-236f4/firestore) → Firestore Database
2. Vytvořte kolekci `allowedUsers`
3. Přidejte dokumenty s emailovými adresami

**Pak upravte `AuthContext.jsx`:**
```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

async function isEmailAllowed(email) {
    const docRef = doc(db, 'allowedUsers', email);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
}
```

**Výhoda:** Můžete měnit emaily bez redeploy aplikace.

---

### Způsob 3: Přes Firebase Authentication (nejjednodušší pro správu)

**V Firebase Console:**

1. Otevřete [Authentication](https://console.firebase.google.com/project/job-application-manager-236f4/authentication/users)
2. Klikněte na **Users** tab
3. Zde uvidíte všechny přihlášené uživatele
4. Můžete je **Disable** (zakázat) nebo **Delete** (smazat)

**Poznámka:** Toto nebrání novému přihlášení, pouze deaktivuje existující účty.

---

## Firestore Security Rules (dodatečná ochrana)

I když máte whitelist v kódu, **doporučuji nastavit i Firestore Security Rules**, aby každý uživatel viděl pouze svá data.

### Jak nastavit Security Rules:

1. Otevřete [Firestore Rules](https://console.firebase.google.com/project/job-application-manager-236f4/firestore/rules)

2. Nahraďte pravidla tímto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Povolení přístupu pouze přihlášeným uživatelům
    match /{document=**} {
      allow read, write: if request.auth != null 
                         && request.auth.token.email in [
                           'pavel@cecinafrica.com',
                           'pav.suba@gmail.com'
                         ];
    }
    
    // Nebo ještě lepší - každý uživatel vidí pouze svá data:
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}
```

3. Klikněte **Publish**

**Co to dělá:**
- Nikdo nemůže číst/zapisovat data bez přihlášení
- Pouze whitelistované emaily mají přístup
- Každý uživatel vidí pouze svá vlastní data (pokud jsou uložena pod `users/{userId}/`)

---

## Storage Security Rules (pro CV soubory)

Podobně zabezpečte i Cloud Storage:

1. Otevřete [Storage Rules](https://console.firebase.google.com/project/job-application-manager-236f4/storage/rules)

2. Nahraďte pravidla:

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

3. Klikněte **Publish**

---

## Testování

### Test 1: Povolený email
1. Přihlaste se s `pavel@cecinafrica.com` nebo `pav.suba@gmail.com`
2. ✅ Měli byste získat přístup

### Test 2: Nepovolený email
1. Přihlaste se s jiným Google účtem
2. ❌ Měli byste vidět chybu a být automaticky odhlášeni

---

## Rychlá reference

| Akce | Kde | Jak |
|------|-----|-----|
| Přidat email | `src/context/AuthContext.jsx` | Přidat do `ALLOWED_EMAILS` |
| Odebrat email | `src/context/AuthContext.jsx` | Smazat z `ALLOWED_EMAILS` |
| Firestore pravidla | Firebase Console → Firestore → Rules | Nastavit whitelist |
| Storage pravidla | Firebase Console → Storage → Rules | Nastavit whitelist |
| Zakázat uživatele | Firebase Console → Authentication → Users | Disable/Delete |

---

## Důležité poznámky

⚠️ **Po každé změně v kódu:**
1. `npm run build`
2. `firebase deploy`

⚠️ **Firestore/Storage Rules:**
- Změny se projeví okamžitě (bez redeploy)
- Jsou nezávislé na kódu aplikace
- Poskytují dodatečnou vrstvu zabezpečení

✅ **Doporučení:**
- Používejte whitelist v kódu (už implementováno)
- + Nastavte Firestore Security Rules (doporučeno)
- + Nastavte Storage Security Rules (doporučeno)

Tři vrstvy zabezpečení = maximální ochrana! 🔒
