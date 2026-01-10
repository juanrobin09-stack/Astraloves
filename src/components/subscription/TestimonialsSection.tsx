import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah", tier: "ELITE", text: "Guardian m'a stoppée net. Je répétais le même pattern avec 3 mecs différents. ASTRA a vu avant moi." },
    { name: "Thomas", tier: "PREMIUM", text: "Fini le swipe aléatoire. La synastrie est dingue. 87% avec ma copine actuelle. On se comprend sans parler." },
    { name: "Léa", tier: "ELITE", text: "Le Silence recommandé... j'ai arrêté de spammer. Il m'a recontactée 2 jours après. ASTRA savait." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h3 className="text-2xl font-display font-bold text-center mb-12">Ce qu'ils disent</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="glass-effect p-6 rounded-large">
            <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-cosmic-gold text-cosmic-gold" />)}</div>
            <p className="text-sm mb-4">{t.text}</p>
            <p className="text-xs text-white/60">— {t.name}, {t.tier}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
