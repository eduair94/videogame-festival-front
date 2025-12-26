import { FileSpreadsheet, Gamepad2, Github, Heart, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">GameEvents</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Discover indie game festivals, showcases, and award ceremonies. 
              Stay updated with submission deadlines and event dates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/?view=all#events" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/?view=open#events" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Open Submissions
                </Link>
              </li>
              <li>
                <Link href="/?view=upcoming#events" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Upcoming Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1NGseGNHv6Tth5e_yuRWzeVczQkzqXXGF4k16IsvyiTE/edit?usp=drivesdk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors text-sm flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Source Spreadsheet
                </a>
              </li>
              <li>
                <a 
                  href="https://videogame-events-api.vercel.app/openapi.json" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/eduair94/videogame-events-api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} GameEvents. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-pink-500" /> by{' '}
            <a 
              href="https://www.linkedin.com/in/eduardo-airaudo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
            >
              Eduardo Airaudo
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
