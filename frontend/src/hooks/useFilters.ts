import { useState, useEffect } from 'react';
import { Article, Practice, Claim } from '@/types/article';

interface UseFiltersProps {
    articles: Article[];
    practices: Practice[];
    claims: Claim[];
}

interface ArticleWithValidMetadata extends Article {
    practice: string[];
    claim: string[];
}

export const useFilters = ({ articles, practices, claims }: UseFiltersProps) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedPractice, setSelectedPractice] = useState<string>('All');
    const [selectedClaim, setSelectedClaim] = useState<string>('All');
    const [startYear, setStartYear] = useState<string>('');
    const [endYear, setEndYear] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Get only articles with valid practices/claims
    const articlesWithValidMetadata = articles
        .map(article => {
            const validPractices = article.practice?.map(practiceId => {
                const practice = practices.find(p => p._id === practiceId);
                return practice?.valid ? practice.name : null;
            }).filter(Boolean) as string[] || [];

            const validClaims = article.claim?.map(claimId => {
                const claim = claims.find(c => c._id === claimId);
                return claim?.valid ? claim.name : null;
            }).filter(Boolean) as string[] || [];

            if (validPractices.length === 0 && validClaims.length === 0) {
                return null;
            }

            return {
                ...article,
                practice: validPractices,
                claim: validClaims
            };
        })
        .filter((article): article is ArticleWithValidMetadata => article !== null);

    const statusOptions = Array.from(
        new Set(articlesWithValidMetadata.map(a => a.status || '').filter(s => s && s !== 'Unknown'))
    ) as string[];

    const practiceOptions = Array.from(
        new Set(practices.filter(p => p.valid).map(p => p.name))
    );

    const claimOptions = Array.from(
        new Set(claims.filter(c => c.valid).map(c => c.name))
    );

    const validateYears = (start: string, end: string) => {
        const s = parseInt(start),
            e = parseInt(end);
        if (start && end && s > e) {
            setErrorMessage('End year cannot be earlier than start year');
            return false;
        }
        if ((start && s < 1900) || (end && e > new Date().getFullYear())) {
            setErrorMessage('Years must be between 1900 and the current year');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    useEffect(() => {
        if (startYear || endYear) validateYears(startYear, endYear);
    }, [startYear, endYear]);

    useEffect(() => setSelectedClaim('All'), [selectedPractice]);

    const filteredArticles = articlesWithValidMetadata
        .filter((article) => {
            const year = parseInt(article.published_date) || 0;

            return (
                (selectedStatus === 'All' || article.status === selectedStatus) &&
                (selectedPractice === 'All' ||
                    article.practice.includes(selectedPractice)) &&
                (selectedClaim === 'All' ||
                    article.claim.includes(selectedClaim)) &&
                (!startYear ||
                    !endYear ||
                    (year >= parseInt(startYear) && year <= parseInt(endYear))) &&
                (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (Array.isArray(article.author) ? article.author.join(', ') : article.author || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    article.description?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        })
        .sort((a, b) =>
            sortOrder === 'asc'
                ? (parseInt(a.published_date) || 0) - (parseInt(b.published_date) || 0)
                : (parseInt(b.published_date) || 0) - (parseInt(a.published_date) || 0)
        );

    return {
        filters: {
            selectedStatus,
            setSelectedStatus,
            selectedPractice,
            setSelectedPractice,
            selectedClaim,
            setSelectedClaim,
            startYear,
            setStartYear,
            endYear,
            setEndYear,
            searchQuery,
            setSearchQuery,
            sortOrder,
            setSortOrder,
        },
        options: {
            statusOptions,
            practiceOptions,
            claimOptions,
        },
        errorMessage,
        filteredArticles,
    };
};
