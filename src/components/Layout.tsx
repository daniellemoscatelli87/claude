import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Projetos', end: true },
  { to: '/catalogo', label: 'Catálogo de Métricas', end: false },
  { to: '/guia', label: 'Guia Rápido', end: false },
]

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="shrink-0 border-b border-slate-200 bg-white md:w-64 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-brand-600">Métricas para Designers</p>
          <p className="mt-1 text-xs text-slate-500">
            Do problema à métrica: planeje, colete e acompanhe dados por projeto.
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
