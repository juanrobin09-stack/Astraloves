export default function AppFooter() {
  return (
    <footer className="bg-black/90 border-t border-orange-500/50 px-4 py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-400 leading-relaxed mt-20 md:mt-32">

          {/* Texte gauche */}
          <div className="text-center md:text-left order-2 md:order-1">
            Divertissement • 18+ • Pas de conseil médical
          </div>

          {/* Liens droite - responsive */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 justify-center md:justify-end order-1 md:order-2 w-full md:w-auto">

            <a
              href="/privacy"
              className="hover:text-orange-400 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Politique de confidentialité
            </a>

            <span className="hidden md:inline mx-1">|</span>

            <a
              href="/cgv"
              className="hover:text-orange-400 transition-colors duration-200 hover:underline underline-offset-2"
            >
              CGV
            </a>

            <span className="hidden md:inline mx-1">|</span>

            <a
              href="/mentions"
              className="hover:text-orange-400 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Mentions légales
            </a>

            <span className="hidden md:inline mx-1">|</span>

            <a
              href="mailto:astra.loveai@gmail.com"
              className="hover:text-orange-400 transition-colors duration-200 hover:underline underline-offset-2"
            >
              Contact
            </a>

          </div>

        </div>

        {/* Email en bas - toujours visible */}
        <div className="mt-3 pt-3 border-t border-gray-800 text-center text-xs text-gray-500 md:hidden">
          astra.loveai@gmail.com
        </div>
      </div>
    </footer>
  );
}
