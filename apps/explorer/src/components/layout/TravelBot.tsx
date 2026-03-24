
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase';
import { solveTravelQuery } from '@/ai/flows/travel-bot-flow';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function TravelBot() {
  const { user } = useUser();
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello Explorer! I'm Ruth, your Aetheria AI Assistant. I can help you with your bookings, trip passes, or Aetheria features. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLang = availableLanguages.find(l => l.code === language)?.englishName || 'English';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await solveTravelQuery({
        uid: user.uid,
        messages: newMessages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          content: m.content
        })),
        language: currentLang
      });

      setMessages(prev => [...prev, { role: 'model', content: result.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having a little trouble connecting to the Aetheria AI network. Could you try asking that again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !mounted) return null;

  return (
    <div id="aetheria-bot-node" className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <Card className={cn(
          "mb-4 w-80 sm:w-96 border-none shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto transition-all duration-300",
          isMinimized ? "h-16" : "h-[500px]"
        )}>
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-tighter leading-none text-white">Ruth: Aetheria AI Assistant</CardTitle>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400">Aetheria AI Grid Active</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-red-500/20" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-0 bg-slate-50 flex-grow overflow-hidden flex flex-col h-[380px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div key={i} className={cn(
                        "flex w-full gap-3",
                        m.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}>
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm flex-shrink-0">
                          {m.role === 'model' ? (
                            <div className="bg-primary h-full w-full flex items-center justify-center text-white"><Bot size={14} /></div>
                          ) : (
                            <AvatarImage src={user.photoURL || ''} />
                          )}
                          <AvatarFallback className="text-[10px]">{m.role === 'model' ? 'R' : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed",
                          m.role === 'user' 
                            ? "bg-primary text-white rounded-tr-none shadow-md" 
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm"
                        )}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                          <div className="bg-slate-200 h-full w-full flex items-center justify-center text-slate-400 animate-pulse"><Bot size={14} /></div>
                        </Avatar>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                  <Input 
                    placeholder="Ask Ruth about your odyssey..." 
                    className="h-10 rounded-xl bg-slate-50 border-none text-xs" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="submit" size="icon" className="h-10 w-10 rounded-xl" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}

      <Button 
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }} 
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl pointer-events-auto transition-all duration-500 scale-100 active:scale-95",
          isOpen ? "bg-slate-900 rotate-90" : "bg-primary hover:scale-110"
        )}
      >
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-accent rounded-full border-2 border-white flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-slate-900 fill-slate-900" />
          </div>
        )}
      </Button>
    </div>
  );
}
