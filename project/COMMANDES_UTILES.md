# ⚡ COMMANDES UTILES - ASTRA

## 🚀 DÉVELOPPEMENT

### **Lancer l'app en dev** :
```bash
npm run dev
```
Puis ouvre : http://localhost:5173

### **Builder pour production** :
```bash
npm run build
```

### **Prévisualiser le build** :
```bash
npm run preview
```

### **Lancer diagnostic automatique** :
```bash
./diagnostic.sh
```

---

## 🔍 VÉRIFICATIONS

### **Chercher fichiers anciens** :
```bash
find src -name "*old*" -o -name "*legacy*" -o -name "*v1*"
```
Résultat attendu : (vide)

### **Chercher références anciennes URLs** :
```bash
grep -r "astra-v1\|astra-old\|localhost:3000" src/
```
Résultat attendu : (vide)

### **Vérifier port Vite** :
```bash
cat package.json | grep '"dev"'
```
Résultat attendu : `"dev": "vite"`

### **Vérifier ResetPasswordPage** :
```bash
ls -lh src/components/ResetPasswordPage.tsx
wc -l src/components/ResetPasswordPage.tsx
```
Résultat attendu : 238 lignes

### **Vérifier détection #type=recovery** :
```bash
grep -n "type === 'recovery'" src/App.tsx
```
Résultat attendu : Ligne 96

---

## 🧹 NETTOYAGE

### **Nettoyer cache navigateur** :
```javascript
// Dans console navigateur (F12)
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### **Nettoyer node_modules** :
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Nettoyer build** :
```bash
rm -rf dist
npm run build
```

---

## 🐛 DEBUGGING

### **Voir erreurs build** :
```bash
npm run build 2>&1 | grep -i error
```

### **Voir warnings build** :
```bash
npm run build 2>&1 | grep -i warning
```

### **Voir taille build** :
```bash
npm run build 2>&1 | grep -E "dist/.*kB"
```

### **Tester reset password en local** :
```javascript
// Dans console navigateur
window.location.hash = '#type=recovery&access_token=fake';
location.reload();
```

### **Vérifier session Supabase** :
```javascript
// Dans console navigateur
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
console.log('Email vérifié:', data.session?.user?.email_confirmed_at);
```

### **Vérifier email vérifié** :
```javascript
// Dans console navigateur
const { data } = await supabase.auth.getUser();
console.log('Email vérifié:', !!data.user?.email_confirmed_at);
```

---

## 📊 STATISTIQUES

### **Compter lignes de code** :
```bash
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1
```

### **Compter composants React** :
```bash
find src/components -name "*.tsx" | wc -l
```

### **Taille dossier src** :
```bash
du -sh src/
```

### **Taille build** :
```bash
du -sh dist/
```

### **Lister tous les guides** :
```bash
ls -lh *.md | awk '{printf "%-40s %8s\n", $9, $5}'
```

---

## 🔧 SUPABASE

### **Tester connexion Supabase** :
```bash
curl -s "https://vlpyjblasmkugfyfxoia.supabase.co/rest/v1/" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscHlqYmxhc21rdWdmeWZ4b2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzEwMzQsImV4cCI6MjA3ODcwNzAzNH0.w8_2YYQ7uH11F0GACHGQ1D-9CwL47-cbdCsVQHp72Dg" \
  | head -20
```

### **Vérifier .env** :
```bash
cat .env | grep VITE_SUPABASE
```

---

## 📧 EMAILS

### **Simuler réception email en dev** :
```bash
# Ouvre Inbucket
open "https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/inbucket"
```

### **Voir logs auth Supabase** :
```bash
# Ouvre Auth Logs
open "https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/logs/auth-logs"
```

### **Tester email vérification** :
```javascript
// Dans console navigateur (après inscription)
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'ton-email@example.com'
});
console.log('Email renvoyé:', !error);
```

### **Tester reset password** :
```javascript
// Dans console navigateur
const { error } = await supabase.auth.resetPasswordForEmail('ton-email@example.com');
console.log('Email reset envoyé:', !error);
```

---

## 🎨 UI

### **Tester responsive** :
```javascript
// Dans console navigateur
// Mobile
window.resizeTo(375, 667);
// Tablet
window.resizeTo(768, 1024);
// Desktop
window.resizeTo(1920, 1080);
```

### **Voir toutes les pages** :
```bash
grep -o "page === '[^']*'" src/App.tsx | sort -u
```

### **Lister tous les composants** :
```bash
ls src/components/*.tsx | sed 's|src/components/||' | sed 's|.tsx||'
```

---

## 📚 DOCUMENTATION

### **Ouvrir CONFIG_RAPIDE** :
```bash
cat CONFIG_RAPIDE.md
```

### **Ouvrir STATUT_PROJET** :
```bash
cat STATUT_PROJET.md
```

### **Chercher dans les guides** :
```bash
grep -i "mot de passe oublié" *.md
```

### **Compter documentation** :
```bash
wc -l *.md | tail -1
```

---

## 🚀 RACCOURCIS

### **Diagnostic complet** :
```bash
./diagnostic.sh && npm run build
```

### **Reset cache + build** :
```bash
rm -rf dist node_modules/.vite && npm run build
```

### **Ouvrir tous les guides Supabase** :
```bash
open "https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/providers"
open "https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/auth/url-configuration"
open "https://supabase.com/dashboard/project/vlpyjblasmkugfyfxoia/settings/auth"
```

---

## 🎯 COMMANDES ESSENTIELLES (copie-colle)

```bash
# 1. Lance le diagnostic
./diagnostic.sh

# 2. Build le projet
npm run build

# 3. Lance le dev server
npm run dev

# 4. Ouvre l'app dans le navigateur
open http://localhost:5173

# 5. Vérifie qu'il n'y a pas d'anciens fichiers
find src -name "*old*" -o -name "*v1*"

# 6. Vérifie ResetPasswordPage
ls -lh src/components/ResetPasswordPage.tsx
```

---

## 💡 ASTUCES

### **Voir les erreurs React en temps réel** :
- Ouvre DevTools (F12)
- Console
- Filtre : "error"

### **Débugger Supabase Auth** :
```javascript
// Dans console navigateur
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

### **Forcer refresh session** :
```javascript
// Dans console navigateur
await supabase.auth.refreshSession();
location.reload();
```

### **Tester sans cache** :
- Chrome : Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Firefox : Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)
- Safari : Cmd+Option+R

---

## 📞 AIDE RAPIDE

**Si un truc ne marche pas** :

1. Lance `./diagnostic.sh`
2. Lis l'erreur
3. Cherche dans les guides : `grep -i "ton-erreur" *.md`
4. Vérifie Supabase Dashboard
5. Vérifie console navigateur (F12)

**Fichiers d'aide** :
- README_EMAILS.md (ce fichier)
- CONFIG_RAPIDE.md (config Supabase)
- STATUT_PROJET.md (état complet)
- VERIFICATION_INTERFACE_MODERNE.md (diagnostic)

---

**⚡ TOUTES LES COMMANDES SONT PRÊTES À COPIER-COLLER ! 🚀**
