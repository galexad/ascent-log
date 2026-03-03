import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';
import type { Application, ApplicationStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { ApplicationModal } from './ApplicationModal';
import { DndContext, type DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../hooks/useApplications';

export function KanbanBoard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const { applications, isLoading, isError, error, updateStatus } = useApplications();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const applicationId = active.id as string;
        const newStatus = over.id as ApplicationStatus;

        const app = applications?.find((a: Application) => a.id === applicationId);
        if (app && app.status !== newStatus) {
            updateStatus({ id: applicationId, status: newStatus, app });
        }
    };

    const handleEdit = (app: Application) => {
        setEditingApp(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingApp(null);
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-red-500 gap-4">
                <p>Error loading applications: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['applications', user?.id] })}
                    className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white hover:bg-mint-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    const columns: { title: string; status: ApplicationStatus }[] = [
        { title: 'Applied', status: 'Applied' },
        { title: 'In Progress', status: 'In Progress' },
        { title: 'Archived', status: 'Archived' },
    ];

    return (
        <div className="flex h-full flex-col p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Job Applications</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your job hunt process.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-mint-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-500 transition-colors"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Application
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            applications={applications?.filter((app: Application) => app.status === col.status) || []}
                            onEdit={handleEdit}
                            onStatusChange={(id, newStatus) => {
                                const app = applications?.find((a: Application) => a.id === id);
                                if (app) updateStatus({ id, status: newStatus, app });
                            }}
                        />
                    ))}
                </div>
            </DndContext>

            {isModalOpen && (
                <ApplicationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    application={editingApp}
                />
            )}
        </div>
    );
}
