import { useDroppable } from '@dnd-kit/core';
import type { Application, ApplicationStatus } from "../types"
import { ApplicationCard } from './ApplicationCard';

interface KanbanColumnProps {
    key?: string | number;
    title: string;
    status: ApplicationStatus;
    applications: Application[];
    onEdit: (app: Application) => void;
    onStatusChange: (id: number, status: ApplicationStatus) => void;
}

export function KanbanColumn({ title, status, applications, onEdit, onStatusChange }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex w-80 shrink-0 flex-col rounded-2xl p-4 transition-colors ${isOver ? 'bg-mint-50 dark:bg-mint-900/20 ring-2 ring-mint-500/50' : 'bg-gray-100/50 dark:bg-slate-800/50'
                }`}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                    {applications.length}
                </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                {applications.map((app) => (
                    <ApplicationCard
                        key={app.id}
                        application={app}
                        onEdit={() => onEdit(app)}
                        onStatusChange={(newStatus) => onStatusChange(app.id, newStatus)}
                    />
                ))}
                {applications.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-sm text-gray-400 dark:text-gray-500">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
