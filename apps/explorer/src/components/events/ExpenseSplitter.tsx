
'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  DollarSign,
  PieChart,
  History,
  TrendingUp,
  ArrowRight, 
  Sparkles, 
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { calculateExpenseSplit, type CalculateExpenseSplitOutput } from '@/ai/flows/calculate-expense-split-flow';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  payerName: string;
}

export function ExpenseSplitter({ event, language }: { event: any, language: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [splitResult, setSplitResult] = useState<CalculateExpenseSplitOutput | null>(null);

  const handleAddExpense = () => {
    if (!newDesc || !newAmount || !user) return;
    const expense: Expense = {
      id: Math.random().toString(36).substring(7),
      description: newDesc,
      amount: parseFloat(newAmount),
      payerId: user.uid,
      payerName: user.displayName?.split(' ')[0] || 'You'
    };
    setExpenses([...expenses, expense]);
    setNewDesc('');
    setNewAmount('');
  };

  const handleRemove = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    setSplitResult(null);
  };

  const handleCalculate = async () => {
    if (expenses.length === 0) return;
    setIsCalculating(true);
    try {
      const result = await calculateExpenseSplit({
        expenses: expenses.map(({ description, amount, payerId, payerName }) => ({ description, amount, payerId, payerName })),
        participantIds: event.participantIds || [],
        language
      });
      setSplitResult(result);
    } catch (e) {
      toast({ variant: 'destructive', title: "Logic Failure", description: "Could not synthesize expense ledger." });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter italic">Event Ledger</CardTitle>
              <CardDescription className="text-slate-400 font-medium">Log group expenditures for this odyssey.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {expenses.map((exp) => (
                  <div className="p-6 flex items-center gap-4 group hover:bg-slate-50 transition-all" key={exp.id}>
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{exp.description}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid by {exp.payerName}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xl font-black font-headline text-slate-900">${exp.amount.toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="text-slate-300 hover:text-destructive" onClick={() => handleRemove(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="p-12 text-center opacity-30 grayscale flex flex-col items-center gap-4">
                    <History className="h-12 w-12" />
                    <p className="font-bold text-sm uppercase tracking-widest">Ledger Silent</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-slate-50 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 w-full">
                <Input 
                  placeholder="Expense (e.g. Group Dinner)" 
                  className="sm:col-span-6 h-12 rounded-xl" 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="sm:col-span-3 h-12 rounded-xl" 
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                />
                <Button className="sm:col-span-3 h-12 rounded-xl font-black" onClick={handleAddExpense}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Button 
            onClick={handleCalculate} 
            disabled={expenses.length === 0 || isCalculating}
            className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            {isCalculating ? <Loader2 className="animate-spin mr-2" /> : <><Sparkles className="mr-2 h-6 w-6" /> Synthesize Split Logic</>}
          </Button>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {splitResult ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 text-white p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart className="h-32 w-32 text-primary" /></div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <Badge className="bg-primary text-white border-none font-bold uppercase mb-4 px-3">Synthesis Resolved</Badge>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Spend</p>
                        <p className="text-4xl font-black font-headline">${splitResult.totalGroupSpend.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Per Person</p>
                        <p className="text-4xl font-black font-headline">${splitResult.averagePerPerson.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 pb-2">Settlements</p>
                    {splitResult.settlements.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{s.fromName}</span>
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="font-bold text-slate-400">{s.toName}</span>
                        </div>
                        <span className="font-headline font-black text-xl text-primary">${s.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 italic">"{splitResult.summary}"</p>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center text-center opacity-20 grayscale py-20">
              <TrendingUp className="h-32 w-32 mb-4 mx-auto" />
              <p className="text-3xl font-black font-headline uppercase tracking-tighter italic">Finance Node Pending</p>
              <p className="max-w-xs mx-auto text-sm font-bold mt-2">Log group expenses to synthesize an optimized split strategy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
