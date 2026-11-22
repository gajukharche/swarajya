import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { logoutAdminAction } from './login/actions';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Palette,
  Tags,
  Settings,
  LogOut,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Collections', href: '/admin/collections', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Theme Customizer', href: '/admin/theme-customizer', icon: Palette },
    { name: 'Discounts', href: '/admin/discounts', icon: Tags },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-zinc-800">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-xs">
                A
              </span>
              Apex Admin
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3 px-2">
            <div>
              <p className="text-sm font-medium text-white truncate">{session?.name || 'Admin'}</p>
              <p className="text-xs text-zinc-400 truncate">{session?.email}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
              {session?.role || 'STAFF'}
            </span>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/20">
          <div className="text-sm text-zinc-400">
            Storefront Status: <span className="text-emerald-400 font-medium">Live (ISR Active)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              View Storefront ↗
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
