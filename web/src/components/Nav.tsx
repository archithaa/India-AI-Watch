import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight">India AI Watch Tracker</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/states/ka" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            Karnataka
          </Link>
          <Link href="/methodology" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            Methodology
          </Link>
          <Link href="/data" className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            Open Data
          </Link>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors text-xs"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  )
}
