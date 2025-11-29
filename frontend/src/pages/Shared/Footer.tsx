export default function Footer() {
    return (
        <footer className="bg-slate-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm">
                        © 2025 EduLink. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                        <a href="#" className="hover:text-blue-400 transition-colors">Centre d'aide</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Contactez-nous</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Conditions d'utilisation</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
