"use client";

import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, Send, Trash2, ChevronLeft, ChevronRight, Code, Bug, Zap, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { analyzeCode } from "@/lib/api";
import { ErrorBoundary } from 'react-error-boundary'; // Import ErrorBoundary
import { OPENROUTER_API_KEY } from "@/lib/constants"; // You'll need to create this
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatMessage {
    role: string;
    content: string;
}

interface SupportedLanguage {
    id: string;
    display: string;
    monacoId: string;
}

export default function CodeEditor() {
    const { theme } = useTheme();
    const [editorTheme, setEditorTheme] = useState("vs-dark");
    const [code, setCode] = useState<string>("");
    const [originalCode, setOriginalCode] = useState<string>("");
    const [optimizedCode, setOptimizedCode] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [activeTab, setActiveTab] = useState("review");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [codeReview, setCodeReview] = useState("");
    const [bugReport, setBugReport] = useState<Array<{ title: string; description: string }>>([]);
    const [explanation, setExplanation] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoadingScan, setIsLoadingScan] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const editorRef = useRef<any>(null);

    const supportedLanguages: SupportedLanguage[] = [
        { id: "javascript", display: "JavaScript", monacoId: "javascript" },
        { id: "python", display: "Python", monacoId: "python" },
        { id: "java", display: "Java", monacoId: "java" },
        { id: "cpp", display: "C++", monacoId: "cpp" },
        { id: "c", display: "C", monacoId: "c" },
    ];

    const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");

    useEffect(() => {
        setEditorTheme(theme === "light" ? "light" : "vs-dark");
    }, [theme]);

    useEffect(() => {
        const savedApiKey = localStorage.getItem("geminiApiKey");
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const linkify = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return `[${part}](${part})`;
            }
            return part;
        }).join('');
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            const codeContext = `Current code in editor:\n\`\`\`\n${code}\n\`\`\`\n\nUser question: ${inputMessage}`;
            const newUserMessage = { role: "user", content: inputMessage };
            setChatMessages([...chatMessages, { role: "user", content: inputMessage }]);
            setInputMessage("");
            setIsLoadingChat(true);

            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "HTTP-Referer": `${window.location.origin}`,
                        "X-Title": "CodeSage Assistant"
                    },
                    body: JSON.stringify({
                        model: "google/gemini-pro",
                        messages: [
                            {
                                role: "system",
                                content: "You are CodeSage, an expert programming assistant. You help users with their programming queries, provide code explanations, suggest optimizations, and assist with debugging. Always consider the code context provided when answering questions."
                            },
                            ...chatMessages.map(msg => 
                                msg.role === "user" 
                                    ? { ...msg, content: `Code context:\n\`\`\`\n${code}\n\`\`\`\n\nUser question: ${msg.content}` }
                                    : msg
                            ),
                            newUserMessage
                        ]
                    }),
                });

                const data = await response.json();
                const assistantResponse = data.choices[0].message.content;
                const processedResponse = linkify(assistantResponse);
                setChatMessages(prev => [...prev, { role: "assistant", content: processedResponse }]);
            } catch (error) {
                console.error("Chat error:", error);
                setChatMessages(prev => [...prev, { 
                    role: "assistant", 
                    content: "I apologize, but I encountered an error processing your request. Please try again." 
                }]);
            } finally {
                setIsLoadingChat(false);
            }
        }
    };

    const handleSaveApiKey = () => {
        localStorage.setItem("geminiApiKey", apiKey);
        setIsSettingsOpen(false);
    };

    const handleAnalyzeCode = async () => {
        setIsLoadingScan(true);
        setError(null);

        try {
            setOriginalCode(code);
            console.log("Sending request to:", `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze`);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    language: selectedLanguage
                }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                setError(errorData.detail || 'An error occurred');
                return;
            }

            const data = await response.json();
            console.log("Backend Response Data:", data);

            // Data type checks and logging:
            console.log("typeof data.summary:", typeof data.summary);
            console.log("typeof data.bugs:", typeof data.bugs);
            console.log("typeof data.improvements:", typeof data.improvements);
            console.log("typeof data.optimized_code:", typeof data.optimized_code);


            // Verify the data structure
            if (!data.summary || !data.bugs || !data.improvements || !data.optimized_code) {
                console.error("Invalid response structure:", data);
                setError('Invalid response format from server');
                return;
            }

            setCodeReview(data.summary);
            setBugReport(data.bugs);
            setOptimizedCode(data.optimized_code);
            setExplanation(data.improvements);
            setShowDiff(true);
            setActiveTab("review");
        } catch (error) {
            console.error("Error analyzing code:", error);
            setError('Failed to analyze code');
        } finally {
            setIsLoadingScan(false);
        }
    };

    const handleAcceptChanges = () => {
        if (editorRef.current && optimizedCode) {
            editorRef.current.setValue(optimizedCode);
            setCode(optimizedCode);
            setOptimizedCode("");
            setShowDiff(false);
            setExplanation("");
        }
    };

    const handleRejectChanges = () => {
        setOptimizedCode("");
        setShowDiff(false);
        setExplanation("");
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleClearChat = () => {
        setChatMessages([]);
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    return (
        <div className="flex h-[calc(100vh-72px)]">
            {/* Chat sidebar (no changes) */}
            <div className={`${isChatOpen ? 'w-1/3' : 'w-12'} transition-all duration-300 border-r dark:border-gray-800 relative`}>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleChat}
                        className="w-12 h-12 flex items-center justify-center relative group"
                    >
                        {isChatOpen ? <ChevronLeft /> : <ChevronRight />}
                        {!isChatOpen && (
                            <div
                                className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 dark:bg-white/80 text-white dark:text-black px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-lg"
                            >
                                AI Assistant
                            </div>
                        )}
                    </Button>
                </div>

                {isChatOpen && (
                    <div className="h-[calc(100%-3rem)] flex flex-col p-4">
                        {/* Chat content (no changes) */}
                        <div className="flex-grow overflow-y-auto mb-4 bg-gray-100 dark:bg-zinc-400/5 rounded-lg p-4 relative">
                            {chatMessages.length === 0 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <Image
                                            src="/whiteFischerLogo.png"
                                            alt="Fischer Logo light"
                                            width={100}
                                            height={100}
                                            className="hidden dark:block"
                                        />
                                        <Image
                                            src="/blackFischerLogo.png"
                                            alt="Fischer Logo dark"
                                            width={100}
                                            height={100}
                                            className="dark:hidden"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <p className="text-lg font-semibold text-gray-400/50 dark:text-gray-600/40 font-mono">
                                            I'm CodeSage, your programming assistant. Ask me anything about your code!
                                        </p>
                                    </div>
                                </>
                            )}
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
                                >
                                    <span
                                        className={`inline-block px-4 py-2 rounded-lg ${
                                            msg.role === "user"
                                                ? "bg-black text-white dark:bg-white dark:text-gray-900"
                                                : "bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300"
                                        }`}
                                    >
                                        <ReactMarkdown 
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a 
                                                        {...props} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-blue-500 hover:text-blue-600 underline cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (props.href) {
                                                                window.open(props.href, '_blank');
                                                            }
                                                        }}
                                                        style={{ wordBreak: 'break-all' }}
                                                    />
                                                )
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        {/* Chat input (no changes) */}
                        <div className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your code..."
                                className="flex-grow"
                            />
                            <Button onClick={handleSendMessage} disabled={isLoadingChat}>
                                {isLoadingChat ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                            <Button onClick={handleClearChat} variant="outline">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Code Editor (no changes) */}
            <div className="w-1/2 flex flex-col p-6 border-r dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">Code Editor</h2>
                        <Select
                            value={selectedLanguage}
                            onValueChange={setSelectedLanguage}
                        >
                            <SelectTrigger className={`w-[140px] ${theme === 'light' ? 'bg-white text-black border border-gray-300' : 'bg-black text-white border border-gray-600'}`}>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent className={`${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                {supportedLanguages.map((lang) => (
                                    <SelectItem key={lang.id} value={lang.id}>
                                        {lang.display}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleAnalyzeCode}
                            disabled={isLoadingScan}
                            className="flex items-center gap-2"
                        >
                            {isLoadingScan ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            Smart Scan
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-9 h-9"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-grow border rounded-lg overflow-hidden shadow-sm">
                    <Editor
                        height="100%"
                        defaultLanguage={selectedLanguage}
                        language={selectedLanguage}
                        theme={editorTheme}
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        onMount={handleEditorDidMount}
                    />
                </div>
            </div>

            {/* Analysis Results Panel */}
            <div className="w-1/2 p-6 overflow-y-auto">
                <div className="flex space-x-3 mb-6">
                    <TabButton active={activeTab === "review"} onClick={() => setActiveTab("review")}>
                        <Code className="w-4 h-4 mr-2" />
                        Code Review
                    </TabButton>
                    <TabButton active={activeTab === "bugs"} onClick={() => setActiveTab("bugs")}>
                        <Bug className="w-4 h-4 mr-2" />
                        Bug Detection
                    </TabButton>
                    <TabButton active={activeTab === "optimization"} onClick={() => setActiveTab("optimization")}>
                        <Zap className="w-4 h-4 mr-2" />
                        Optimization
                    </TabButton>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl">
                            {activeTab === "review" && "Code Review"}
                            {activeTab === "bugs" && "Bug Detection"}
                            {activeTab === "optimization" && "Optimization"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {error && (
                            <div className="p-4 mb-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                {error}
                            </div>
                        )}

                        {activeTab === "review" && (
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{codeReview || "Click 'Smart Scan' to see code review."}</ReactMarkdown>
                            </div>
                        )}

                        {activeTab === "bugs" && (
                            <div className="space-y-4">
                                {bugReport.length > 0 ? (
                                    bugReport.map((bug, index) => {
                                        console.log(`Rendering bug ${index}:`, bug); // <-- LOGGING BUG OBJECT
                                        console.log(`typeof bug.title:`, typeof bug.title); // <-- LOGGING bug.title TYPE
                                        return (
                                            <div key={index} className="p-4 border rounded-lg dark:border-gray-800">
                                                <h3 className="text-lg font-semibold text-red-500 mb-2">{bug.title}</h3>
                                                {/* Conditionally render bug.description */}
                                                {typeof bug.description === 'string' && bug.description.trim() !== '' && (
                                                    <p className="text-gray-600 dark:text-gray-400">{bug.description}</p>
                                                )}
                                                {typeof bug.description === 'string' && bug.description.trim() === '' && (
                                                    <p className="text-gray-500 italic">Description is intentionally empty.</p>
                                                )}
                                                {bug.description == null && (
                                                    <p className="text-gray-500 italic">No description provided.</p>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500">Click 'Smart Scan' to detect potential bugs.</p>
                                )}
                            </div>
                        )}

{activeTab === "optimization" && (
    <div className="space-y-6">
        {error ? (
            <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                {error}
            </div>
        ) : showDiff ? (
            <>
                <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{Array.isArray(explanation) ? explanation.join("\n\n") : explanation || 'No improvements suggested'}</ReactMarkdown>
                </div>
                <div className="border rounded-lg p-4 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Optimized Code:</h3>
                    <Editor
                        height="200px"
                        defaultLanguage={selectedLanguage}
                        theme={editorTheme}
                        value={optimizedCode || code}
                        options={{ readOnly: true, minimap: { enabled: false } }}
                    />
                    <div className="flex gap-3 mt-4">
                        <Button 
                            onClick={handleAcceptChanges}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={!optimizedCode}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Accept Changes
                        </Button>
                        <Button 
                            onClick={handleRejectChanges}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Reject Changes
                        </Button>
                    </div>
                </div>
            </>
        ) : (
            <p className="text-gray-500">Click 'Smart Scan' to see optimization suggestions.</p>
        )}
    </div>
)}
                        
                    </CardContent>
                </Card>
            </div>

            {/* Settings Dialog (no changes) */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>API Settings</DialogTitle>
                        <DialogDescription>
                            Enter your Gemini API key to enable code analysis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="apiKey">Gemini API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveApiKey}>Save</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700/50 dark:text-white dark:hover:bg-gray-600/50"
            }`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}