import { Building2, Calendar, MoreVertical, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { cn } from '../lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface ApplicationCardProps {
    key?: string | number;
    application: Application;
    onEdit: () => void;
    onStatusChange: (status: ApplicationStatus) => void;
}

export function ApplicationCard({ application, onEdit, onStatusChange }: ApplicationCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id,
        data: application,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const statuses: ApplicationStatus[] = ['Applied', 'In Progress', 'Archived'];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all hover:shadow-md dark:hover:shadow-slate-900/50",
                isDragging && "shadow-lg ring-2 ring-mint-500/50"
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div
                    className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4 shrink-0" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{application.position}</h4>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Building2 className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{application.company}</span>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black/5">
                            <button
                                onClick={() => {
                                    onEdit();
                                    setIsMenuOpen(false);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <Edit2 className="mr-2 h-4 w-4 text-gray-400" />
                                Edit details
                            </button>
                            <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                            <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">Move to...</div>
                            {statuses.filter(s => s !== application.status).map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        onStatusChange(status);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    {status}
                                </button>
                            ))}
                            <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this application?')) {
                                        deleteMutation.mutate(application.id);
                                    }
                                    setIsMenuOpen(false);
                                }}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {application.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-6">{application.description}</p>
            )}

            {application.feedback && application.status !== 'Applied' && (
                <div className="ml-6 rounded-lg bg-mint-50 dark:bg-mint-900/20 p-2.5 text-sm text-mint-900 dark:text-mint-300 border border-mint-100/50 dark:border-mint-800/50">
                    <span className="font-medium">Feedback: </span>
                    {application.feedback}
                </div>
            )}

            <div className="mt-1 ml-6 flex items-center text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {new Date(application.updated_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}
            </div>
        </div>
    );
}
