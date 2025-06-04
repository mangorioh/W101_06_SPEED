import { useState, useEffect } from 'react';

interface RatingSummary {
    averageRating: number;
    ratingCount: number;
}

export const useRatings = (articleIds: string[]) => {
    const [ratingSummaries, setRatingSummaries] = useState<Record<string, RatingSummary>>({});
    const [userRatings, setUserRatings] = useState<Record<string, number | null>>({});

    const getJwt = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    useEffect(() => {
        const fetchRatings = async () => {
            const newSummaries: Record<string, RatingSummary> = {};
            const newUserRatings: Record<string, number | null> = {};

            await Promise.all(
                articleIds.map(async (articleId) => {
                    try {
                        // Fetch rating summary
                        const summaryResponse = await fetch(
                            `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}/rating/summary`
                        );
                        if (summaryResponse.ok) {
                            const summary = await summaryResponse.json();
                            newSummaries[articleId] = summary;
                        }

                        // Fetch user's rating if logged in
                        const jwt = getJwt();
                        if (jwt) {
                            const userRatingResponse = await fetch(
                                `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}/rating`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${jwt}`,
                                    },
                                }
                            );
                            if (userRatingResponse.ok) {
                                if (userRatingResponse.status === 204) {
                                    newUserRatings[articleId] = null;
                                } else {
                                    const text = await userRatingResponse.text();
                                    if (!text) {
                                        newUserRatings[articleId] = null;
                                    } else {
                                        const rating = JSON.parse(text);
                                        newUserRatings[articleId] = rating;
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching ratings for article ${articleId}:`, error);
                    }
                })
            );

            setRatingSummaries(newSummaries);
            setUserRatings(newUserRatings);
        };

        if (articleIds.length > 0) {
            fetchRatings();
        }
    }, [articleIds]);

    const handleRatingChange = async (articleId: string, value: number) => {
        const jwt = getJwt();
        if (!jwt) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}/rating`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${jwt}`,
                    },
                    body: JSON.stringify({ value }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setUserRatings((prev) => ({
                ...prev,
                [articleId]: value,
            }));
            setRatingSummaries((prev) => ({
                ...prev,
                [articleId]: {
                    averageRating: result.averageRating,
                    ratingCount: result.ratingCount,
                },
            }));
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    };

    return { ratingSummaries, userRatings, handleRatingChange };
};
