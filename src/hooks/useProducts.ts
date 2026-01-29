import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabaseClient';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (isMounted) {
                    setProducts(data || []);
                }
            } catch (err: any) {
                // Ignore abort errors
                if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                    return;
                }
                console.error('Error fetching products:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch products');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const refetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            setProducts(data || []);
        } catch (err: any) {
            // Ignore abort errors
            if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                return;
            }
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    return { products, loading, error, refetch: refetchProducts };
};
