import React, {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: any) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({isOpen, onClose, onSave}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('bg-blue-500');

    const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-green-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500'
    ];

    const handleSave = () => {
        if (!name.trim()) return;

        const newProject = {
            id: Date.now().toString(),
            name,
            description,
            color
        };

        onSave(newProject);
        setName('');
        setDescription('');
        setColor('bg-blue-500');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter project description"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Color</Label>
                        <div className="flex space-x-2">
                            {colors.map((colorOption) => (
                                <button
                                    key={colorOption}
                                    onClick={() => setColor(colorOption)}
                                    className={`w-8 h-8 rounded-full ${colorOption} ${
                                        color === colorOption ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        Create Project
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
