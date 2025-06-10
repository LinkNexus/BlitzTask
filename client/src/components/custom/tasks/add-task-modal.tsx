import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task, columnId: string) => void;
  columnId: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, columnId }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      priority,
      assignee: {
        name: assignee || 'Unassigned',
        avatar: assignee ? assignee.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NA',
      },
      dueDate,
      labels: labels ? labels.split(',').map((l: string) => l.trim()) : [],
      description,
    };
    onAdd(newTask, columnId);
    setTitle('');
    setPriority('Medium');
    setAssignee('');
    setDueDate('');
    setLabels('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="w-full border rounded px-3 py-2" value={priority} onChange={e => setPriority(e.target.value)}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <input className="w-full border rounded px-3 py-2" value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Labels (comma separated)</label>
            <input className="w-full border rounded px-3 py-2" value={labels} onChange={e => setLabels(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
