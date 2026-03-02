import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to login');

            login(data.user);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-mint-500">
                    <Logo className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Sign in to AscentLog
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-mint-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-500 transition-colors"
                        >
                            Sign in
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-mint-600 dark:text-mint-400 hover:text-mint-500">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
