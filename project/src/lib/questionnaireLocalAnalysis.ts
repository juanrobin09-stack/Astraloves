// Analyse locale des questionnaires avec fallback robuste

interface ProfileScores {
  A: number;
  B: number;
  C: number;
  D: number;
}

interface Profile {
  dominant: 'A' | 'B' | 'C' | 'D';
  scores: ProfileScores;
  percentage: number;
}

export const calculateLocalProfile = (answers: Record<string, any>): Profile => {
  const scores: ProfileScores = { A: 0, B: 0, C: 0, D: 0 };
  const answersList = Object.values(answers);

  answersList.forEach((answer) => {
    if (typeof answer === 'number') {
      if (answer === 0) scores.A++;
      else if (answer === 1) scores.B++;
      else if (answer === 2) scores.C++;
      else if (answer === 3) scores.D++;
    } else if (typeof answer === 'string') {
      const index = parseInt(answer);
      if (!isNaN(index)) {
        if (index === 0) scores.A++;
        else if (index === 1) scores.B++;
        else if (index === 2) scores.C++;
        else if (index === 3) scores.D++;
      }
    }
  });

  const dominant = (Object.keys(scores) as Array<keyof ProfileScores>).reduce((a, b) =>
    scores[a] > scores[b] ? a : b
  );

  const totalAnswers = answersList.length;
  const percentage = totalAnswers > 0 ? Math.round((scores[dominant] / totalAnswers) * 100) : 75;

  return { dominant, scores, percentage };
};

export const generateFullLocalAnalysis = (quizId: string, profile: Profile): any => {
  const analyses: Record<string, Record<string, any>> = {
    'first_impression': {
      A: {
        mainResult: "🦁 Le Leader Charismatique",
        description: "Tu captes l'attention naturellement. Dès que tu entres quelque part, on te remarque. Ton énergie est contagieuse et ton assurance inspire. Tu as ce don de mettre les gens à l'aise tout en imposant naturellement le respect.\n\nLes gens sont attirés par ta présence magnétique et ton leadership naturel. Tu dégages une confiance en toi qui rassure et inspire.",
        strengths: "• Charisme naturel qui captive\n• Confiance en soi inspirante\n• Capacité à fédérer les gens\n• Leadership inné",
        attention: "• Ne pas devenir arrogant\n• Écouter autant que briller\n• Laisser de l'espace aux autres\n• Rester authentique",
        advice: "• Utilise ton charisme pour créer des connexions authentiques\n• Équilibre ta présence forte avec de l'écoute\n• Montre aussi ta vulnérabilité pour créer de vraies connexions\n• Ne cherche pas juste à impressionner\n• Sois aussi accessible que charismatique",
        improvements: "• Développe ton empathie\n• Pratique l'écoute active\n• Montre ta sensibilité\n• Sois ouvert aux critiques"
      },
      B: {
        mainResult: "🐺 L'Énigmatique Magnétique",
        description: "Tu ne dis pas tout, et c'est ce qui fascine. Ton regard en dit plus que mille mots. Les gens sont attirés par ce qu'ils ne comprennent pas encore chez toi.\n\nTon aura mystérieuse crée une attraction irrésistible. On veut percer tes secrets et comprendre ce qui se cache derrière ton regard profond.",
        strengths: "• Aura mystérieuse captivante\n• Profondeur qui intrigue\n• Magnétisme naturel\n• Présence intense",
        attention: "• Ne pas être trop distant\n• S'ouvrir quand nécessaire\n• Éviter de jouer avec les gens\n• Créer de vraies connexions",
        advice: "• Le mystère attire mais l'ouverture connecte\n• Laisse parfois tomber le masque\n• Partage tes pensées profondes avec les bonnes personnes\n• Utilise ton intensité pour créer des liens authentiques\n• Balance mystère et authenticité",
        improvements: "• Ose montrer tes émotions\n• Sois plus accessible\n• Partage davantage\n• Crée des ponts vers les autres"
      },
      C: {
        mainResult: "🐬 L'Ami(e) Idéal(e)",
        description: "Ta chaleur est palpable. Les gens se sentent écoutés et acceptés en ta présence. Tu as ce don rare de mettre tout le monde à l'aise.\n\nTon authenticité et ta bienveillance créent un espace safe où les gens peuvent être eux-mêmes. On se sent bien avec toi instantanément.",
        strengths: "• Bienveillance naturelle\n• Écoute active authentique\n• Empathie profonde\n• Accessibilité chaleureuse",
        attention: "• Ne pas te faire écraser\n• Poser tes limites\n• Montrer aussi ta force\n• Éviter de te sacrifier",
        advice: "• Ta gentillesse est une force, pas une faiblesse\n• Ose aussi montrer ta profondeur et ton intensité\n• Fixe des boundaries pour te protéger\n• Attire romantiquement en montrant aussi ton pouvoir\n• Reste doux mais montre ta complexité",
        improvements: "• Affirme-toi davantage\n• Montre tes limites\n• Révèle ta force intérieure\n• Ose dire non"
      },
      D: {
        mainResult: "🦉 L'Outsider Intrigant",
        description: "Tu ne rentres pas dans les cases, et c'est ta force. Les gens se souviennent de toi parce que tu es différent(e). Ton originalité laisse une empreinte.\n\nTon unicité fait que tu ne passes jamais inaperçu. On ne t'oublie pas car tu as quelque chose que personne d'autre n'a.",
        strengths: "• Originalité marquante\n• Sens de l'observation aiguisé\n• Profondeur cachée\n• Authenticité rare",
        attention: "• Ne pas te sur-isoler\n• Partager ton monde intérieur\n• Te connecter aux autres\n• Ne pas fuir les connexions",
        advice: "• Ton unicité est précieuse, assume-la pleinement\n• Partage ton monde intérieur avec les bonnes personnes\n• Utilise ton observation pour créer des connexions\n• Sois fier de ta différence\n• Attire ceux qui apprécient l'authentique",
        improvements: "• Ose t'ouvrir davantage\n• Crée des ponts sociaux\n• Partage tes passions\n• Connecte avec tes semblables"
      }
    },
    'astral': {
      A: {
        mainResult: "🔥 Âme de Feu",
        description: "Tu es une force de la nature. Passionné(e), courageux(se), tu avances dans la vie avec une énergie brûlante. Tu inspires les autres par ton audace et ton enthousiasme contagieux.\n\nTon élément dominant est le FEU - tu incarnes la passion, l'action et la transformation. Comme le Bélier, le Lion ou le Sagittaire, tu brûles de vivre intensément.",
        strengths: "• Passion débordante\n• Leadership naturel\n• Courage et audace\n• Spontanéité inspirante",
        attention: "• Tempérer ton impulsivité\n• Écouter avant d'agir\n• Patience avec les autres\n• Ne pas brûler ceux qui t'aiment",
        advice: "• Canalise ta flamme plutôt que de la laisser consumer\n• En amour, trouve quelqu'un qui peut suivre ton rythme\n• Apprends à ralentir parfois pour apprécier le moment\n• Utilise ton feu pour illuminer, pas pour brûler\n• Équilibre passion et patience",
        improvements: "• Développe la patience\n• Pratique l'écoute\n• Cultive la constance\n• Apprends à tempérer tes émotions"
      },
      B: {
        mainResult: "🌍 Âme de Terre",
        description: "Tu es le roc sur lequel on peut compter. Stable, persévérant(e), tu construis ta vie brique par brique avec patience et détermination. Ta présence rassure et ancre.\n\nTon élément dominant est la TERRE - tu incarnes la stabilité, la sensualité et le pragmatisme. Comme le Taureau, la Vierge ou le Capricorne, tu es fiable et solide.",
        strengths: "• Fiabilité à toute épreuve\n• Patience remarquable\n• Sensualité profonde\n• Pragmatisme efficace",
        attention: "• Ne pas devenir trop rigide\n• S'ouvrir au changement\n• Oser l'imprévu\n• Lâcher le contrôle parfois",
        advice: "• Ose sortir de ta zone de confort, l'imprévu peut être magique\n• En amour, laisse place à la spontanéité\n• Ta stabilité est précieuse mais n'oublie pas de vivre aussi\n• Équilibre sécurité et aventure\n• Permets-toi d'être vulnérable",
        improvements: "• Accepte le changement\n• Sois plus flexible\n• Ose l'inconnu\n• Vis dans le moment présent"
      },
      C: {
        mainResult: "💨 Âme d'Air",
        description: "Tu es le vent du changement. Intellectuel(le), sociable, tu as besoin de mouvement et de connexions. Les idées sont ton terrain de jeu et ta curiosité est insatiable.\n\nTon élément dominant est l'AIR - tu incarnes l'intelligence, la communication et la liberté. Comme les Gémeaux, la Balance ou le Verseau, tu as besoin de voler.",
        strengths: "• Intelligence vive\n• Communication fluide\n• Adaptabilité remarquable\n• Esprit libre",
        attention: "• S'ancrer davantage\n• Approfondir les connexions\n• Finir ce que tu commences\n• Ne pas fuir l'émotionnel",
        advice: "• Ancre-toi parfois, les plus belles connexions demandent de la constance\n• En amour, trouve un équilibre entre liberté et engagement\n• Approfondis plutôt que de rester en surface\n• Utilise ton intelligence pour comprendre tes émotions\n• Permets-toi d'aller en profondeur",
        improvements: "• Développe ta constance\n• Approfondis tes relations\n• Connecte-toi à tes émotions\n• Pratique l'engagement"
      },
      D: {
        mainResult: "💧 Âme d'Eau",
        description: "Tu es l'océan des émotions. Profond(e), intuitif(ve), tu ressens tout intensément. Ton empathie est ton don le plus précieux et ta sensibilité ta force.\n\nTon élément dominant est l'EAU - tu incarnes l'intuition, l'empathie et la profondeur. Comme le Cancer, le Scorpion ou les Poissons, tu ressens le monde.",
        strengths: "• Intuition puissante\n• Empathie profonde\n• Sensibilité artistique\n• Capacité de transformation",
        attention: "• Protéger ton énergie\n• Mettre des limites\n• Ne pas absorber tout\n• Prendre du recul émotionnel",
        advice: "• Protège ton énergie, tu absorbes les émotions des autres\n• En amour, trouve quelqu'un qui honore ta profondeur\n• Apprends à filtrer ce que tu ressens\n• Ta sensibilité est un super-pouvoir, utilise-la sagement\n• Équilibre empathie et protection",
        improvements: "• Établis des boundaries\n• Protège-toi émotionnellement\n• Prends du recul quand nécessaire\n• Pratique le détachement sain"
      }
    },
    'attachment': {
      A: {
        mainResult: "💗 Attachement Anxieux",
        description: "Tu aimes intensément et profondément. Tu as besoin de proximité et de validation. Ton cœur bat fort pour ceux que tu aimes et tu recherches la réassurance.\n\nTon pattern principal : tu t'inquiètes parfois de la solidité de tes relations et tu cherches des preuves d'amour. Cela vient souvent d'un besoin de sécurité émotionnelle.",
        strengths: "• Capacité d'aimer profondément\n• Attention aux besoins de l'autre\n• Loyauté indéfectible\n• Engagement total",
        attention: "• Peur de l'abandon parfois excessive\n• Besoin de réassurance fréquent\n• Tendance à l'anxiété relationnelle\n• Risque de dépendance affective",
        advice: "• Apprends à te rassurer toi-même avant de chercher chez l'autre\n• Ta valeur ne dépend pas du regard de ton partenaire\n• Cultive ton indépendance émotionnelle\n• Communique tes besoins sans accusation\n• Pratique l'auto-apaisement",
        improvements: "• Développe ton autonomie émotionnelle\n• Travaille sur ta confiance en toi\n• Pratique la méditation\n• Consulte si nécessaire"
      },
      B: {
        mainResult: "🛡️ Attachement Évitant",
        description: "Tu valorises ton autonomie et ton espace. Tu aimes à ta façon, souvent par des actes plutôt que des mots. Tu as besoin d'indépendance pour te sentir bien.\n\nTon pattern principal : tu maintiens parfois une distance émotionnelle pour te protéger. L'intimité peut te sembler étouffante même si tu la désires.",
        strengths: "• Indépendance forte\n• Force émotionnelle\n• Capacité à être seul(e)\n• Autonomie remarquable",
        attention: "• Difficulté à s'ouvrir émotionnellement\n• Peur de l'intimité profonde\n• Peut paraître distant(e) ou froid(e)\n• Tendance à fuir l'engagement",
        advice: "• L'intimité n'est pas une prison, c'est une connexion\n• S'ouvrir peut enrichir ta vie sans te diminuer\n• Trouve un équilibre entre indépendance et proximité\n• Communique tes besoins d'espace clairement\n• Ose la vulnérabilité progressivement",
        improvements: "• Pratique l'ouverture émotionnelle\n• Partage tes sentiments\n• Accepte le besoin de connexion\n• Travaille sur l'intimité"
      },
      C: {
        mainResult: "🌊 Attachement Désorganisé",
        description: "Tu oscilles entre le besoin de connexion et la peur de celle-ci. Ton cœur est complexe et tes émotions parfois contradictoires. Tu veux et tu as peur en même temps.\n\nTon pattern principal : tu alternes entre rapprochement et éloignement, créant une dynamique push-pull qui peut être déroutante pour toi et les autres.",
        strengths: "• Profondeur émotionnelle unique\n• Capacité de remise en question\n• Authenticité dans la complexité\n• Sensibilité aiguë",
        attention: "• Inconstance relationnelle\n• Confusion émotionnelle\n• Difficulté à maintenir l'équilibre\n• Peut blesser sans le vouloir",
        advice: "• Comprends tes patterns pour les transformer\n• La conscience de soi est le premier pas vers la guérison\n• Trouve un(e) thérapeute si nécessaire\n• Sois patient(e) avec toi-même dans ce voyage\n• Travaille sur la cohérence émotionnelle",
        improvements: "• Consulte un professionnel\n• Travaille sur tes blessures\n• Pratique la régulation émotionnelle\n• Développe la constance"
      },
      D: {
        mainResult: "💚 Attachement Sécurisé",
        description: "Tu as une relation saine avec l'intimité. Tu sais donner et recevoir de l'amour sans anxiété excessive ni évitement. Tu es à l'aise avec la proximité et l'autonomie.\n\nTon pattern principal : tu navigues les relations avec confiance, maturité émotionnelle et équilibre. Tu es un modèle de santé relationnelle.",
        strengths: "• Équilibre émotionnel stable\n• Communication saine et claire\n• Confiance en soi et en l'autre\n• Maturité relationnelle",
        attention: "• Attentes parfois trop élevées envers les autres\n• Peut sous-estimer les difficultés\n• Risque de ne pas voir les red flags\n• Peut manquer d'empathie pour les styles insécures",
        advice: "• Continue à cultiver cette sécurité intérieure\n• Tu peux aider les autres à se sentir en sécurité aussi\n• Reste vigilant(e) mais ouvert(e)\n• Choisis des partenaires qui honorent ton équilibre\n• Maintiens ta santé relationnelle",
        improvements: "• Sois conscient(e) des styles différents\n• Pratique l'empathie envers l'insécure\n• Reste vigilant(e) aux red flags\n• Continue ton développement personnel"
      }
    },
    'archetype': {
      A: {
        mainResult: "👑 Le Roi / La Reine",
        description: "Tu es né(e) pour protéger et diriger. En amour, tu es le pilier sur lequel on peut compter. Tu aimes avec honneur, loyauté et une volonté de construire quelque chose de solide.\n\nTu offres sécurité, direction et protection. Tu prends les rênes naturellement dans la relation et tu veux le meilleur pour ton/ta partenaire.",
        strengths: "• Leadership en amour\n• Loyauté à toute épreuve\n• Protection constante\n• Volonté de construire",
        attention: "• Risque de devenir contrôlant(e)\n• Peut étouffer par excès de protection\n• Difficulté à lâcher prise\n• Peut imposer sa vision",
        advice: "• Apprends à laisser l'autre te protéger aussi\n• La vulnérabilité n'est pas une faiblesse\n• Partage le pouvoir dans la relation\n• Écoute autant que tu diriges\n• L'amour n'est pas un royaume à gouverner seul(e)",
        improvements: "• Pratique le lâcher-prise\n• Partage les décisions\n• Accepte d'être vulnérable\n• Écoute davantage"
      },
      B: {
        mainResult: "🎭 Le Séducteur / La Séductrice",
        description: "Tu vis pour la flamme, le frisson, le jeu. En amour, tu apportes excitation, passion et intensité. Tu sais faire sentir l'autre vivant(e) et désiré(e).\n\nTu offres mystère, passion et des moments inoubliables. Chaque instant avec toi est chargé d'électricité et d'intensité.",
        strengths: "• Passion dévorante\n• Charisme magnétique\n• Capacité à séduire\n• Intensité émotionnelle",
        attention: "• Peut fuir quand la passion s'essouffle\n• Risque de jouer avec les cœurs\n• Difficulté avec la routine\n• Peur de l'engagement profond",
        advice: "• La vraie passion peut durer si tu la cultives\n• Apprends à trouver l'excitation dans la profondeur\n• L'engagement n'est pas une cage\n• Utilise ton intensité pour approfondir, pas juste enflammer\n• La vraie connexion dépasse le frisson initial",
        improvements: "• Développe la constance\n• Approfondis tes relations\n• Travaille sur l'engagement\n• Trouve la magie dans le quotidien"
      },
      C: {
        mainResult: "🌹 L'Amant(e) Romantique",
        description: "Tu aimes avec tout ton être. En amour, tu te donnes entièrement et tu crées une connexion profonde et intime. Tu fais sentir l'autre aimé(e) inconditionnellement.\n\nTu offres tendresse, présence totale et dévotion. Ton amour est un sanctuaire où l'autre peut se sentir en sécurité et célébré(e).",
        strengths: "• Dévotion profonde\n• Empathie exceptionnelle\n• Présence totale\n• Amour inconditionnel",
        attention: "• Risque de te perdre dans l'autre\n• Dépendance affective possible\n• Peut négliger ses propres besoins\n• Difficulté à mettre des limites",
        advice: "• Aime-toi autant que tu aimes l'autre\n• Ton amour déborde quand ton propre cœur est plein\n• Garde une partie de toi pour toi\n• Fixe des boundaries même en amour\n• L'amour sain inclut le respect de soi",
        improvements: "• Cultive ton amour-propre\n• Fixe des limites saines\n• Garde ton identité propre\n• Équilibre don et réception"
      },
      D: {
        mainResult: "🦋 L'Aventurier(e) Libre",
        description: "Tu aimes comme le vent - libre et imprévisible. En amour, tu apportes légèreté, aventure et une perspective unique. Tu refuses les cages et cherches un(e) partenaire de voyage.\n\nTu offres liberté, spontanéité et inspiration. Avec toi, l'amour est une aventure sans cesse renouvelée.",
        strengths: "• Liberté d'esprit\n• Spontanéité rafraîchissante\n• Perspective unique\n• Légèreté inspirante",
        attention: "• Peut fuir l'engagement\n• Blesser par détachement\n• Difficulté avec la routine\n• Peut éviter la profondeur",
        advice: "• La liberté et l'engagement ne sont pas opposés\n• On peut voler ensemble sans se perdre\n• L'engagement peut être une aventure aussi\n• Trouve quelqu'un qui vole avec toi\n• La profondeur peut coexister avec la liberté",
        improvements: "• Travaille sur l'engagement\n• Approfondis tes connexions\n• Reste présent(e)\n• Balance liberté et proximité"
      }
    }
  };

  const result = analyses[quizId]?.[profile.dominant];

  if (!result) {
    return {
      mainResult: "✨ Profil Analysé",
      description: "Ton profil unique révèle une personnalité riche et nuancée. Continue à explorer qui tu es à travers nos autres quiz !",
      strengths: "• Tu as une bonne connaissance de toi\n• Tu es ouvert(e) à la découverte\n• Tu cherches à t'améliorer\n• Tu es authentique",
      attention: "• Continue d'explorer\n• Reste ouvert(e) au changement\n• Écoute ton intuition",
      advice: "• Prends le temps de te connaître\n• Communique tes besoins\n• Fais confiance à ton intuition\n• Célèbre tes progrès",
      improvements: "• Approfondis ta réflexion\n• Explore de nouvelles expériences\n• Développe ton intelligence émotionnelle"
    };
  }

  return {
    ...result,
    percentage: profile.percentage
  };
};

export const getEmergencyResult = (quizId: string): any => ({
  mainResult: "✨ Analyse Complétée",
  description: "Ton profil unique a été analysé avec succès. Les étoiles révèlent une personnalité riche, complexe et authentique. Continue d'explorer qui tu es vraiment !",
  strengths: "• Authenticité et honnêteté\n• Ouverture d'esprit\n• Volonté de se connaître\n• Courage de se remettre en question",
  advice: "• Continue à explorer qui tu es\n• Fais confiance à ton intuition\n• Sois patient(e) avec toi-même\n• Célèbre tes découvertes\n• Utilise ces insights pour grandir",
  improvements: "• Approfondis ta connaissance de toi\n• Partage tes découvertes avec confiance\n• Applique ces insights dans ta vie",
  percentage: 75
});
