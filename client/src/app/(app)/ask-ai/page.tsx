"use client";

import React, {useEffect, useState} from 'react';
import {BarChart3, Brain, Calendar, Lightbulb, Send, TrendingUp, Users, Zap} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Progress} from '@/components/ui/progress';
import {usePageInfos} from "@/components/custom/page-infos-provider";

export default function AskAIPage() {
    const {setInfos} = usePageInfos();

    useEffect(() => {
        setInfos({
            title: 'AI Assistant',
            currentActiveNavItem: 'Ask AI'
        })
    }, []);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Hi! I\'m your AI assistant. I can help you optimize your workflow, generate task suggestions, analyze team performance, and provide insights. How can I assist you today?',
            timestamp: '10:00 AM'
        }
    ]);

    const suggestions = [
        {id: 1, text: 'Analyze team productivity this week', icon: BarChart3},
        {id: 2, text: 'Suggest task priorities for tomorrow', icon: Calendar},
        {id: 3, text: 'Generate meeting agenda for project review', icon: Users},
        {id: 4, text: 'Optimize current sprint workflow', icon: TrendingUp},
    ];

    const insights = [
        {
            title: 'Team Performance',
            value: '85%',
            trend: '+12%',
            description: 'Your team is performing above average this week',
            color: 'text-green-600'
        },
        {
            title: 'Task Completion Rate',
            value: '92%',
            trend: '+5%',
            description: 'Tasks are being completed efficiently',
            color: 'text-blue-600'
        },
        {
            title: 'Upcoming Deadlines',
            value: '3',
            trend: 'Due soon',
            description: 'Critical tasks need attention this week',
            color: 'text-orange-600'
        }
    ];

    const automations = [
        {
            id: 1,
            name: 'Daily Standup Reminders',
            description: 'Automatically remind team members about daily standups',
            active: true,
            savings: '30 min/week'
        },
        {
            id: 2,
            name: 'Task Priority Suggestions',
            description: 'AI suggests task priorities based on deadlines and dependencies',
            active: true,
            savings: '2 hours/week'
        },
        {
            id: 3,
            name: 'Progress Report Generation',
            description: 'Automatically generate weekly progress reports',
            active: false,
            savings: '1 hour/week'
        },
        {
            id: 4,
            name: 'Meeting Summary Creation',
            description: 'Generate meeting summaries and action items',
            active: false,
            savings: '45 min/week'
        }
    ];

    const handleSendMessage = () => {
        if (input.trim()) {
            const newMessage = {
                id: messages.length + 1,
                type: 'user',
                content: input,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            };

            setMessages([...messages, newMessage]);

            // Simulate AI response
            setTimeout(() => {
                const aiResponse = {
                    id: messages.length + 2,
                    type: 'ai',
                    content: generateAIResponse(input),
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                };
                setMessages(prev => [...prev, aiResponse]);
            }, 1000);

            setInput('');
        }
    };

    const generateAIResponse = (userInput: string) => {
        const responses = [
            "Based on your team's current workload, I recommend prioritizing the API integration tasks this week. They're blocking other team members' work.",
            "I've analyzed your project timeline and found that you can optimize delivery by 2 weeks by parallelizing the design and development phases.",
            "Your team's productivity has increased by 15% since implementing the new workflow. The main contributing factors are better task distribution and clearer deadlines.",
            "I suggest scheduling a code review session for Thursday. Three team members have pending pull requests that need attention.",
            "Based on your meeting patterns, I recommend consolidating your daily standups with the weekly planning meeting to save 2 hours per week."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <p className="text-gray-600 mt-1">Get intelligent insights and automate your workflow</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Chat */}
                <div className="lg:col-span-2">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white"/>
                                </div>
                                <CardTitle>AI Assistant</CardTitle>
                                <Badge className="bg-green-100 text-green-800">Online</Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[400px] p-4">
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-md p-3 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}>
                                                <p className="text-sm">{message.content}</p>
                                                <p className={`text-xs mt-1 ${
                                                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                    {message.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>

                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder="Ask me anything about your projects..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                >
                                    <Send className="w-4 h-4"/>
                                </Button>
                            </div>

                            {/* Quick Suggestions */}
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion) => (
                                        <Button
                                            key={suggestion.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSuggestionClick(suggestion.text)}
                                            className="text-xs"
                                        >
                                            <suggestion.icon className="w-3 h-3 mr-1"/>
                                            {suggestion.text}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* AI Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500"/>
                                <span>AI Insights</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {insights.map((insight, index) => (
                                <div key={index} className="p-3 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-gray-900">{insight.value}</span>
                                            <span className={`text-xs ml-1 ${insight.color}`}>{insight.trend}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600">{insight.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Automations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-blue-500"/>
                                <span>Automations</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {automations.map((automation) => (
                                <div key={automation.id} className="p-3 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-sm text-gray-900">{automation.name}</h4>
                                        <Badge
                                            className={automation.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {automation.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{automation.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-xs text-blue-600 font-medium">Saves {automation.savings}</span>
                                        <Button size="sm" variant="outline" className="text-xs h-6">
                                            {automation.active ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Productivity Score */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-green-500"/>
                                <span>Productivity Score</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-gray-900 mb-1">85</div>
                                <div className="text-sm text-gray-500">out of 100</div>
                            </div>
                            <Progress value={85} className="mb-4"/>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Task Completion</span>
                                    <span className="font-medium">92%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Meeting Efficiency</span>
                                    <span className="font-medium">78%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Time Management</span>
                                    <span className="font-medium">85%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};