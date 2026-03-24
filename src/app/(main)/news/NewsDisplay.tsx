'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { GetTravelNewsOutput } from '@/ai/flows/news-schemas';

export default function NewsDisplay({ news }: { news: GetTravelNewsOutput | null }) {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
                    {t('news.title')}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    {t('news.subtitle')}
                </p>
            </div>

            {news && news.articles.length > 0 ? (
                <div className="space-y-8">
                    {news.articles.map((article, index) => (
                        <Card key={index} className="transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <CardTitle className="text-xl">{article.title}</CardTitle>
                                    <Badge variant="outline" className="w-fit">{article.category}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-2 pt-1 text-xs">
                                   <Calendar className="h-4 w-4" /> {article.publishedDate} — {t('news.source', { source: article.source })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">{article.summary}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-muted-foreground font-medium">{t('news.error')}</p>
                </div>
            )}
        </div>
    )
}
