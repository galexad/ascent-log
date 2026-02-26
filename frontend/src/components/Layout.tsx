import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';

export function Layout() {
    const [isDark, setIsDark] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    );

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const logout = () => {
        console.log('Logging out...');
        // Add actual logout logic here
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            {/* Sidebar */}
            <div className="flex w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200 dark:border-slate-800">
                    <Logo className="h-8 w-8 text-mint-500" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">AscentLog</span>
                </div>

                <div className="flex-1 px-4 py-6 space-y-1">
                    <div className="flex items-center gap-3 rounded-xl bg-mint-50 dark:bg-mint-500/10 px-3 py-2 text-mint-700 dark:text-mint-400 font-medium">
                        <LayoutDashboard className="h-5 w-5" />
                        Board
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            <span>{isDark ? 'Light' : 'Dark'}</span>
                        </button>

                        <button
                            onClick={logout}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
}

