"use client";

import React, {useEffect, useState} from 'react';
import {FileText, Image, MoreVertical, Paperclip, Search, Send, Smile} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {usePageInfos} from "@/components/custom/page-infos-provider";
import type {} from 'react';

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
    const {setInfos} = usePageInfos();
    const [selectedConversation, setSelectedConversation] = useState('team-general');
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        setInfos({
            title: "Messages",
            currentActiveNavItem: 'Inbox',
        })
    }, []);

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

    // Fix implicit any for event handlers
    const handleEmojiClick = (emoji: string) => {
        setNewMessage((prev: string) => prev + emoji);
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
        <div className="flex flex-col lg:flex-row gap-6 h-[80vh] lg:h-[75vh]">
            {/* Sidebar: Conversations List */}
            <Card className="w-full max-w-md lg:w-80 flex-shrink-0 h-full flex flex-col shadow-md border-0 bg-background/80 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                    <div className="px-4 pb-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-10 rounded-full bg-muted" />
                        </div>
                    </div>
                    <div className="space-y-1 mt-2">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-colors group ${selectedConversation === conv.id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted/60'}`}
                                onClick={() => setSelectedConversation(conv.id)}
                            >
                                <Avatar className="w-9 h-9">
                                    <AvatarImage src="/placeholder.svg" />
                                    <AvatarFallback>{conv.name.split(' ').map((w: string) => w[0]).join('').slice(0,2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm text-foreground truncate">{conv.name}</h4>
                                        {conv.unread > 0 && (
                                            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full animate-pulse">{conv.unread}</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className="text-xs text-muted-foreground">{conv.participants} members</span>
                                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col h-full shadow-md border-0 bg-background/80 backdrop-blur-md">
                <CardHeader className="flex-shrink-0 border-b px-6 py-4 bg-background/80">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">
                                {conversations.find((c) => c.id === selectedConversation)?.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {conversations.find((c) => c.id === selectedConversation)?.participants} members
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Info</DropdownMenuItem>
                                <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                                <DropdownMenuItem>Leave Conversation</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/40">
                    {messages.map((message: Message) => {
                        const isMe = message.sender === 'You';
                        return (
                            <div key={message.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage src="/placeholder.svg" />
                                    <AvatarFallback className="text-xs">{message.avatar}</AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-xs text-foreground">{message.sender}</span>
                                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                                    </div>
                                    {message.type === 'text' ? (
                                        <div className={`rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-background border'} shadow-sm`}>
                                            {message.content}
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-2 mt-1 p-3 rounded-xl max-w-xs ${isMe ? 'bg-primary/80 text-primary-foreground' : 'bg-background border'} shadow-sm`}>
                                            {getMessageIcon(message.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{message.fileName || message.content}</p>
                                                {message.fileSize && (
                                                    <p className="text-xs text-muted-foreground">{message.fileSize}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>

                {/* Message Input */}
                <div className="px-6 py-4 border-t bg-background/90 sticky bottom-0 z-10">
                    {showEmojiPicker && (
                        <div className="mb-3 p-3 bg-muted rounded-xl shadow-lg w-fit">
                            <div className="grid grid-cols-6 gap-2">
                                {emojis.map((emoji: string) => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="p-2 hover:bg-accent rounded text-lg transition-colors"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            multiple
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="rounded-full"
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="rounded-full"
                        >
                            <Smile className="w-5 h-5" />
                        </Button>
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 rounded-full bg-muted px-4"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 rounded-full shadow-md"
                            size="icon"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
