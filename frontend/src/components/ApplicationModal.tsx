import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Application, ApplicationStatus } from "../types"
import { useApplications } from '../hooks/useApplications';

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application | null;
}

export function ApplicationModal({ isOpen, onClose, application }: ApplicationModalProps) {
    const { saveApplication, isSaving } = useApplications();
    const [formData, setFormData] = useState({
        company: application?.company || '',
        position: application?.position || '',
        description: application?.description || '',
        status: (application?.status || 'Applied') as ApplicationStatus,
        feedback: application?.feedback || '',
    });

    useEffect(() => {
        if (application) {
            setFormData({
                company: application.company,
                position: application.position,
                description: application.description || '',
                status: application.status,
                feedback: application.feedback || '',
            });
        } else {
            setFormData({
                company: '',
                position: '',
                description: '',
                status: 'Applied',
                feedback: '',
            });
        }
    }, [application]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveApplication({ id: application?.id, data: formData });
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" >
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-gray-100 dark:border-slate-700" >
                <div className="mb-6 flex items-center justify-between" >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white" >
                        {application ? 'Edit Application' : 'New Application'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" >
                    <div className="grid grid-cols-2 gap-4" >
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
                                Company
                            </label>
                            <input
                                type="text"
                                id="company"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })
                                }
                                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500 sm:text-sm"
                            />
                        </div>
                        <div >
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
                                Position
                            </label>
                            <input
                                type="text"
                                id="position"
                                required
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div >
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
                            Status
                        </label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                            className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500 sm:text-sm"
                        >
                            <option value="Applied" > Applied </option>
                            <option value="In Progress" > In Progress </option>
                            <option value="Archived" > Archived </option>
                        </select>
                    </div>

                    <div >
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
                            Job Description / Notes
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500 sm:text-sm"
                        />
                    </div>

                    {
                        (formData.status === 'In Progress' || formData.status === 'Archived') && (
                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300" >
                                    Feedback / Next Steps
                                </label>
                                <textarea
                                    id="feedback"
                                    rows={2}
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })
                                    }
                                    className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-mint-500 focus:outline-none focus:ring-1 focus:ring-mint-500 sm:text-sm"
                                />
                            </div>
                        )}

                    <div className="mt-6 flex justify-end gap-3" >
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex justify-center items-center gap-2 rounded-xl border border-transparent bg-mint-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 min-w-[140px]"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
