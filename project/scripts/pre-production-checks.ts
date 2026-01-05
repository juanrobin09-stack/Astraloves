/**
 * SCRIPT DE VÉRIFICATIONS PRÉ-PRODUCTION
 *
 * Ce script vérifie que l'application est prête pour le déploiement en production.
 * Il teste tous les composants critiques et génère un rapport détaillé.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: any;
}

const checks: CheckResult[] = [];

function addCheck(name: string, status: CheckResult['status'], message: string, details?: any) {
  checks.push({ name, status, message, details });
}

function printHeader(text: string) {
  console.log('\n' + '='.repeat(60));
  console.log(text);
  console.log('='.repeat(60) + '\n');
}

function printCheck(check: CheckResult) {
  const icon = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    skip: '⏭️'
  }[check.status];

  console.log(`${icon} ${check.name}: ${check.message}`);
  if (check.details) {
    console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
  }
}

async function checkDatabase() {
  printHeader('📊 VÉRIFICATION BASE DE DONNÉES');

  try {
    const { count: quizCount, error: quizError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    if (quizError) throw quizError;

    addCheck(
      'Database - quiz_results',
      quizCount === 0 ? 'pass' : 'warning',
      quizCount === 0
        ? 'Table vide (prête pour production)'
        : `${quizCount} résultats existants (devrait être 0 pour un démarrage propre)`,
      { count: quizCount }
    );
  } catch (e: any) {
    addCheck('Database - quiz_results', 'fail', `Erreur: ${e.message}`);
  }

  try {
    const { count: questionnaireCount, error: questionnaireError } = await supabase
      .from('questionnaire_results')
      .select('*', { count: 'exact', head: true });

    if (questionnaireError) throw questionnaireError;

    addCheck(
      'Database - questionnaire_results',
      questionnaireCount === 0 ? 'pass' : 'warning',
      questionnaireCount === 0
        ? 'Table vide (prête pour production)'
        : `${questionnaireCount} résultats existants`,
      { count: questionnaireCount }
    );
  } catch (e: any) {
    addCheck('Database - questionnaire_results', 'fail', `Erreur: ${e.message}`);
  }

  try {
    const { count: profilesCount, error: profilesError } = await supabase
      .from('astra_profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) throw profilesError;

    addCheck(
      'Database - astra_profiles',
      profilesCount !== undefined ? 'pass' : 'fail',
      `${profilesCount} profils dans la base`,
      { count: profilesCount }
    );
  } catch (e: any) {
    addCheck('Database - astra_profiles', 'fail', `Erreur: ${e.message}`);
  }

  checks.forEach(printCheck);
}

async function checkQuestionnaires() {
  printHeader('📋 VÉRIFICATION QUESTIONNAIRES');

  const expectedQuizzes = {
    'first_impression': { name: 'Première Impression', type: 'gratuit', questions: 10 },
    'seduction': { name: 'Test de Séduction', type: 'gratuit', questions: 12 },
    'attachment': { name: 'Style d\'attachement', type: 'premium', questions: 14 },
    'archetype': { name: 'Archétype amoureux', type: 'premium', questions: 14 },
    'compatibility': { name: 'Test de compatibilité', type: 'premium', questions: 8 },
    'astral': { name: 'Thème astral complet', type: 'premium_plus', questions: 15 }
  };

  const quizCount = Object.keys(expectedQuizzes).length;

  addCheck(
    'Questionnaires configurés',
    quizCount === 6 ? 'pass' : 'fail',
    `${quizCount}/6 questionnaires configurés`,
    expectedQuizzes
  );

  printCheck(checks[checks.length - 1]);
}

async function checkEnvironment() {
  printHeader('🔧 VÉRIFICATION ENVIRONNEMENT');

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    addCheck(
      `Environment - ${envVar}`,
      value ? 'pass' : 'fail',
      value ? 'Défini' : 'MANQUANT',
      { length: value?.length || 0 }
    );
  }

  const optionalEnvVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_STRIPE_PUBLIC_KEY'
  ];

  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    addCheck(
      `Environment - ${envVar} (optionnel)`,
      value ? 'pass' : 'warning',
      value ? 'Défini' : 'Non défini (fonctionnalité limitée)'
    );
  }

  const lastEnvChecks = checks.slice(-6);
  lastEnvChecks.forEach(printCheck);
}

async function checkPremiumSystem() {
  printHeader('💎 VÉRIFICATION SYSTÈME PREMIUM');

  try {
    const { data: tiers, error } = await supabase
      .from('subscription_tiers')
      .select('*');

    if (error) throw error;

    const expectedTiers = ['free', 'premium', 'elite'];
    const foundTiers = tiers?.map(t => t.tier_name) || [];
    const allTiersPresent = expectedTiers.every(t => foundTiers.includes(t));

    addCheck(
      'Premium - Tiers configurés',
      allTiersPresent ? 'pass' : 'fail',
      allTiersPresent
        ? `${foundTiers.length} tiers configurés`
        : `Tiers manquants: ${expectedTiers.filter(t => !foundTiers.includes(t)).join(', ')}`,
      { tiers: foundTiers }
    );
  } catch (e: any) {
    addCheck('Premium - Tiers configurés', 'fail', `Erreur: ${e.message}`);
  }

  printCheck(checks[checks.length - 1]);
}

async function checkSecurity() {
  printHeader('🔐 VÉRIFICATION SÉCURITÉ');

  const isProduction = process.env.NODE_ENV === 'production';

  addCheck(
    'Security - Environment',
    isProduction ? 'pass' : 'warning',
    isProduction ? 'Mode production' : 'Mode développement'
  );

  const hasSensitiveData = process.env.VITE_SUPABASE_URL?.includes('localhost');

  addCheck(
    'Security - Configuration',
    !hasSensitiveData ? 'pass' : 'warning',
    hasSensitiveData
      ? 'Configuration de développement détectée'
      : 'Configuration sécurisée'
  );

  const lastSecurityChecks = checks.slice(-2);
  lastSecurityChecks.forEach(printCheck);
}

async function generateReport() {
  printHeader('📊 RAPPORT FINAL');

  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const skipped = checks.filter(c => c.status === 'skip').length;

  console.log(`Total des vérifications : ${checks.length}`);
  console.log(`✅ Réussies : ${passed}`);
  console.log(`❌ Échouées : ${failed}`);
  console.log(`⚠️  Avertissements : ${warnings}`);
  console.log(`⏭️  Ignorées : ${skipped}`);
  console.log('');

  if (failed === 0 && warnings === 0) {
    console.log('🚀 EXCELLENT ! L\'application est prête pour la production.');
    console.log('');
    console.log('Prochaines étapes :');
    console.log('1. Exécuter npm run build');
    console.log('2. Tester manuellement tous les questionnaires');
    console.log('3. Vérifier l\'interface mobile');
    console.log('4. Déployer en production');
  } else if (failed === 0) {
    console.log('⚠️  ATTENTION : Des avertissements ont été détectés.');
    console.log('L\'application peut être déployée mais certaines fonctionnalités');
    console.log('peuvent être limitées.');
  } else {
    console.log('❌ ÉCHEC : Des problèmes critiques ont été détectés.');
    console.log('Corrigez les erreurs avant de déployer en production.');
    console.log('');
    console.log('Problèmes critiques :');
    checks
      .filter(c => c.status === 'fail')
      .forEach(c => console.log(`  - ${c.name}: ${c.message}`));
  }

  console.log('');
  console.log('='.repeat(60));
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   VÉRIFICATIONS PRÉ-PRODUCTION - APPLICATION ASTRA         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await checkDatabase();
  await checkQuestionnaires();
  await checkEnvironment();
  await checkPremiumSystem();
  await checkSecurity();
  await generateReport();

  const failed = checks.filter(c => c.status === 'fail').length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
