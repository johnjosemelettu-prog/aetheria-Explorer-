'use client'

import { getTravelNews } from '@/ai/flows/get-travel-news-flow';
import NewsDisplay from './NewsDisplay';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useTranslation, availableLanguages } from '@/lib/i18n';
import type { GetTravelNewsOutput } from '@/ai/flows/news-schemas';

// Loading UI
function LoadingSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
             <div className="text-center mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/3 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function NewsPage() {
    const { language } = useTranslation();
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
        return <LoadingSkeleton />;
    }

    return <NewsDisplay news={news} />;
}
