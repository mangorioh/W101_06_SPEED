import { useState, useEffect } from 'react';
import { Article } from '@/types/article';

export const useArticles = (searchQuery: string) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getJwt = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const url = `${process.env.NEXT_PUBLIC_SITE_URL}/articles${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
                    }`;
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${getJwt() ?? ''}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setArticles(processArticleData(data));
                setError('');
            } catch (error) {
                console.error('Error fetching articles:', error);
                setError('Failed to load articles. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [searchQuery]);

    return { articles, loading, error };
};

const processArticleData = (data: any[]) => {
    return data.map((article) => {
        const formatDate = (dateString: string | { $date: string }) => {
            try {
                const dateValue =
                    typeof dateString === 'string' ? dateString : dateString?.$date;
                return new Date(dateValue).getFullYear().toString();
            } catch {
                return 'N/A';
            }
        };

        const authorDisplay = Array.isArray(article.author)
            ? article.author.join(', ')
            : article.author || 'Anonymous';

        return {
            ...article,
            published_date: formatDate(article.published_date),
            updated_date: formatDate(article.updated_date),
            moderated_date: formatDate(article.moderated_date),
            author: authorDisplay,
            status: article.status || 'Pending',
            publisher: article.publisher || 'Unknown Publisher',
        };
    });
};
