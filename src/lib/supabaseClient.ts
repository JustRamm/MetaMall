import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptcehwsycfwfomxnxmcr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Y2Vod3N5Y2Z3Zm9teG54bWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjY3MjIsImV4cCI6MjA4MzIwMjcyMn0.be45-94RYjLs5EDP67PeUyjtIAAEHATnByTFN6GkERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
    id: string;
    username: string;
    avatar_type: string;
    created_at: string;
    updated_at: string;
}

export interface UserPresence {
    user_id: string;
    username: string;
    position_x: number;
    position_y: number;
    direction: string;
    is_moving: boolean;
    last_seen: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    username: string;
    message: string;
    position_x?: number;
    position_y?: number;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image_url?: string;
    position_x: number;
    position_y: number;
    created_at: string;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
}
