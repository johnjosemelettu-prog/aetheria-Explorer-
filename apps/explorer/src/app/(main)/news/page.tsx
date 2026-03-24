
'use client'

import { getTravelNews } from '@/ai/flows/get-travel-news-flow';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import type { GetTravelNewsOutput } from '@/ai/flows/news-schemas';
import { Badge } from '@/components/ui/badge';
import { Calendar, Newspaper } from 'lucide-react';

export default function NewsPage() {
    const { language, t } = useTranslation();
    const [news, setNews] = useState<GetTravelNewsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const langName = availableLanguages.find(l => l.code === language)?.englishName || 'English';

    useEffect(() => {
        async function fetchNews() {
            setIsLoading(true);
            try {
                const data = await getTravelNews({ language: langName });
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch travel news:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNews();
    }, [langName]);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
                <div className="space-y-8">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <header className="text-center mb-16 space-y-4">
                <Badge className="bg-primary/10 text-primary border-none font-bold uppercase tracking-widest py-1 px-3 text-[10px]">Global Insights</Badge>
                <h1 className="font-headline text-4xl font-black tracking-tight md:text-6xl text-slate-900 leading-none uppercase italic">
                    Travel Intelligence
                </h1>
                <p className="mt-4 text-xl text-slate-500 font-medium">The pulse of global exploration, synthesized for you.</p>
            </header>

            {news && news.articles.length > 0 ? (
                <div className="space-y-8">
                    {news.articles.map((article, index) => (
                        <Card key={index} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white hover:shadow-xl transition-all group">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <CardTitle className="text-2xl font-black font-headline text-slate-900 uppercase italic tracking-tighter group-hover:text-primary transition-colors">{article.title}</CardTitle>
                                    <Badge variant="outline" className="w-fit border-primary/20 text-primary font-black uppercase text-[8px]">{article.category}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   <Calendar className="h-3.5 w-3.5" /> {article.publishedDate} — Source: {article.source}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <p className="text-slate-600 font-medium leading-relaxed">{article.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 opacity-30 grayscale">
                    <Newspaper className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-lg font-black uppercase tracking-tighter italic">Ledger Silent</p>
                </div>
            )}
        </div>
    )
}
