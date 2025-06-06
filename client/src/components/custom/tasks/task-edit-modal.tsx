import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {X} from 'lucide-react';

interface Task {
    id: string;
    title: string;
    priority: string;
    assignee: { name: string; avatar: string };
    dueDate: string;
    labels: string[];
    description?: string;
}

interface TaskEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSave: (task: Task) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                task,
                                                                onSave,
                                                            }) => {
    const [formData, setFormData] = useState<Task>({
        id: '',
        title: '',
        priority: 'Medium',
        assignee: {name: '', avatar: ''},
        dueDate: '',
        labels: [],
        description: '',
    });
    const [newLabel, setNewLabel] = useState('');

    useEffect(() => {
        if (task) {
            setFormData(task);
        }
    }, [task]);

    const handleSave = () => {
        if (formData.title.trim()) {
            onSave(formData);
        }
    };

    const addLabel = () => {
        if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, newLabel.trim()]
            }));
            setNewLabel('');
        }
    };

    const removeLabel = (labelToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(label => label !== labelToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLabel();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                            placeholder="Enter task description"
                            rows={3}
                        />
                    </div>

                    {/* Priority and Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData(prev => ({...prev, priority: value}))}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({...prev, dueDate: e.target.value}))}
                            />
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Input
                            id="assignee"
                            value={formData.assignee.name}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                assignee: {
                                    ...prev.assignee,
                                    name: e.target.value,
                                    avatar: e.target.value.split(' ').map(n => n[0]).join('').toUpperCase()
                                }
                            }))}
                            placeholder="Enter assignee name"
                        />
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <Label>Labels</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.labels.map((label, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {label}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                                        onClick={() => removeLabel(label)}
                                    />
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a label"
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addLabel}>
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};