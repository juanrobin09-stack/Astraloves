// SCRIPT DE DÉBOGAGE ET FIX DU SCROLL
console.log('🔧 === DIAGNOSTIC SCROLL ===');

// 1. Vérifier le body
const body = document.body;
console.log('📍 BODY:');
console.log('  - classList:', Array.from(body.classList));
console.log('  - overflow:', window.getComputedStyle(body).overflow);
console.log('  - overflow-y:', window.getComputedStyle(body).overflowY);
console.log('  - height:', window.getComputedStyle(body).height);
console.log('  - position:', window.getComputedStyle(body).position);
console.log('  - inline styles:', body.style.cssText);

// 2. Vérifier #root
const root = document.getElementById('root');
if (root) {
  console.log('📍 ROOT:');
  console.log('  - classList:', Array.from(root.classList));
  console.log('  - overflow:', window.getComputedStyle(root).overflow);
  console.log('  - overflow-y:', window.getComputedStyle(root).overflowY);
  console.log('  - height:', window.getComputedStyle(root).height);
  console.log('  - position:', window.getComputedStyle(root).position);
  console.log('  - inline styles:', root.style.cssText);
}

// 3. Vérifier HTML
const html = document.documentElement;
console.log('📍 HTML:');
console.log('  - overflow:', window.getComputedStyle(html).overflow);
console.log('  - overflow-y:', window.getComputedStyle(html).overflowY);
console.log('  - height:', window.getComputedStyle(html).height);

// 4. APPLIQUER LE FIX
console.log('\n🔧 === APPLYING FIX ===');

// Nettoyer body
body.classList.remove('modal-open');
body.style.removeProperty('overflow');
body.style.removeProperty('height');
body.style.removeProperty('position');
body.style.overflow = 'auto';
body.style.overflowY = 'auto';
console.log('✅ Body nettoyé');

// Nettoyer root
if (root) {
  root.style.removeProperty('overflow');
  root.style.removeProperty('height');
  root.style.removeProperty('position');
  console.log('✅ Root nettoyé');
}

// Nettoyer html
html.style.removeProperty('overflow');
html.style.removeProperty('height');
html.style.overflow = '';
console.log('✅ HTML nettoyé');

// 5. RE-VÉRIFIER
console.log('\n📊 === APRÈS FIX ===');
console.log('📍 BODY:');
console.log('  - overflow:', window.getComputedStyle(body).overflow);
console.log('  - overflow-y:', window.getComputedStyle(body).overflowY);
console.log('  - height:', window.getComputedStyle(body).height);

if (root) {
  console.log('📍 ROOT:');
  console.log('  - overflow:', window.getComputedStyle(root).overflow);
  console.log('  - overflow-y:', window.getComputedStyle(root).overflowY);
  console.log('  - height:', window.getComputedStyle(root).height);
}

console.log('\n✅ Fix appliqué ! Testez le scroll maintenant.');
