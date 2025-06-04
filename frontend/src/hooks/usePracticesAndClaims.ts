import { useState, useEffect } from 'react';
import { Practice, Claim } from '@/types/article';

export const usePracticesAndClaims = () => {
    const [practices, setPractices] = useState<Practice[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getJwt = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jwt = getJwt();
                const headers = { Authorization: `Bearer ${jwt}` };

                const [practicesResponse, claimsResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/practices`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/claims`, { headers })
                ]);

                if (!practicesResponse.ok || !claimsResponse.ok) {
                    throw new Error('Failed to fetch practices or claims');
                }

                const practicesData = await practicesResponse.json();
                const claimsData = await claimsResponse.json();

                setPractices(practicesData);
                setClaims(claimsData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching practices and claims:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { practices, claims, loading, error };
};
