export default function Footer() {
    return (
        <footer className="bg-slate-800 text-gray-300">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
                    <p>© 2025 EduLink. Tous droits réservés.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">FAQ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
