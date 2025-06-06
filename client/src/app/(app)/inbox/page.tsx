"use client";

import React, {useState} from 'react';
import {FileText, Image, MoreVertical, Paperclip, Search, Send, Smile} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';

interface Message {
    id: number;
    sender: string;
    avatar: string;
    content: string;
    timestamp: string;
    type: 'text' | 'file' | 'image';
    fileName?: string;
    fileSize?: string;
}

export default function InboxPage() {
    const [selectedConversation, setSelectedConversation] = useState('team-general');
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const conversations = [
        {
            id: 'team-general',
            name: 'General Team',
            lastMessage: 'Great work on the new features!',
            time: '2m ago',
            unread: 3,
            participants: 12
        },
        {
            id: 'project-alpha',
            name: 'Project Alpha',
            lastMessage: 'Meeting scheduled for tomorrow',
            time: '1h ago',
            unread: 1,
            participants: 8
        },
        {
            id: 'design-team',
            name: 'Design Team',
            lastMessage: 'New mockups uploaded',
            time: '3h ago',
            unread: 0,
            participants: 5
        },
        {
            id: 'dev-team',
            name: 'Development Team',
            lastMessage: 'Code review completed',
            time: '5h ago',
            unread: 2,
            participants: 10
        },
    ];

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'Sarah Wilson',
            avatar: 'SW',
            content: 'Hey team! Just wanted to share the latest updates on our project progress.',
            timestamp: '10:30 AM',
            type: 'text'
        },
        {
            id: 2,
            sender: 'Mike Johnson',
            avatar: 'MJ',
            content: 'Thanks for the update! The new dashboard looks amazing.',
            timestamp: '10:32 AM',
            type: 'text'
        },
        {
            id: 3,
            sender: 'Emma Davis',
            avatar: 'ED',
            content: 'project-mockups.fig',
            timestamp: '10:35 AM',
            type: 'file',
            fileName: 'project-mockups.fig',
            fileSize: '2.4 MB'
        },
        {
            id: 4,
            sender: 'Alex Chen',
            avatar: 'AC',
            content: 'Perfect timing! I was just about to ask for those.',
            timestamp: '10:36 AM',
            type: 'text'
        },
        {
            id: 5,
            sender: 'Sarah Wilson',
            avatar: 'SW',
            content: 'screenshot-2024.png',
            timestamp: '10:40 AM',
            type: 'image',
            fileName: 'screenshot-2024.png',
            fileSize: '1.2 MB'
        },
    ]);

    const emojis = ['😀', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🚀', '💡', '⚡', '🔥'];

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message: Message = {
                id: messages.length + 1,
                sender: 'You',
                avatar: 'YO',
                content: newMessage,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                type: 'text'
            };
            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const message: Message = {
                id: messages.length + 1,
                sender: 'You',
                avatar: 'YO',
                content: file.name,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                type: file.type.startsWith('image/') ? 'image' : 'file',
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            };
            setMessages([...messages, message]);
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const getMessageIcon = (type: string) => {
        switch (type) {
            case 'file':
                return <FileText className="w-4 h-4"/>;
            case 'image':
                return <Image className="w-4 h-4"/>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex w-full justify-center items-center space-x-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                        <Input placeholder="Search conversations..." className="pl-10 w-64"/>
                    </div>
                    <Button variant="outline">
                        <MoreVertical className="w-4 h-4"/>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-1">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                        selectedConversation === conv.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                                    }`}
                                    onClick={() => setSelectedConversation(conv.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{conv.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span
                                                    className="text-xs text-gray-400">{conv.participants} participants</span>
                                                <span className="text-xs text-gray-400">{conv.time}</span>
                                            </div>
                                        </div>
                                        {conv.unread > 0 && (
                                            <Badge className="bg-blue-500 text-white text-xs">{conv.unread}</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="lg:col-span-3 flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg">
                                    {conversations.find(c => c.id === selectedConversation)?.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500">
                                    {conversations.find(c => c.id === selectedConversation)?.participants} participants
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>View Info</DropdownMenuItem>
                                    <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                                    <DropdownMenuItem>Leave Conversation</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>

                    <Separator/>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="flex space-x-3">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage src="/placeholder.svg"/>
                                    <AvatarFallback className="text-xs">{message.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="font-medium text-sm text-gray-900 dark:text-white">{message.sender}</span>
                                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                                    </div>
                                    {message.type === 'text' ? (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{message.content}</p>
                                    ) : (
                                        <div
                                            className="flex items-center space-x-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-xs">
                                            {getMessageIcon(message.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {message.fileName || message.content}
                                                </p>
                                                {message.fileSize && (
                                                    <p className="text-xs text-gray-500">{message.fileSize}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>

                    <Separator/>

                    {/* Message Input */}
                    <div className="p-4 flex-shrink-0">
                        {showEmojiPicker && (
                            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="grid grid-cols-6 gap-2">
                                    {emojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-lg"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <div className="flex space-x-1">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    multiple
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="p-2"
                                >
                                    <Paperclip className="w-4 h-4"/>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2"
                                >
                                    <Smile className="w-4 h-4"/>
                                </Button>
                            </div>
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                <Send className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
