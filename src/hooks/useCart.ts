import { useState, useEffect, useCallback } from 'react';
import { supabase, CartItem, Product } from '../lib/supabaseClient';

interface CartItemWithProduct extends CartItem {
    product?: Product;
}

export const useCart = (userId: string) => {
    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cart_items')
                .select(`
          *,
          product:products(*)
        `)
                .eq('user_id', userId);

            if (error) throw error;

            setCartItems(data || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        try {
            // Check if item already exists in cart
            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', userId)
                .eq('product_id', productId)
                .single();

            if (existing) {
                // Update quantity
                const { error } = await supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + quantity })
                    .eq('id', existing.id);

                if (error) throw error;
            } else {
                // Insert new item
                const { error } = await supabase
                    .from('cart_items')
                    .insert({
                        user_id: userId,
                        product_id: productId,
                        quantity,
                    });

                if (error) throw error;
            }

            await fetchCart();
            return true;
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (cartItemId: string) => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);

            if (error) throw error;

            await fetchCart();
            return true;
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove from cart');
            return false;
        }
    };

    const updateQuantity = async (cartItemId: string, quantity: number) => {
        try {
            if (quantity <= 0) {
                return removeFromCart(cartItemId);
            }

            const { error } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItemId);

            if (error) throw error;

            await fetchCart();
            return true;
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError(err instanceof Error ? err.message : 'Failed to update quantity');
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            await fetchCart();
            return true;
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear cart');
            return false;
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + (Number(price) * item.quantity);
    }, 0);

    return {
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        refetch: fetchCart,
    };
};
