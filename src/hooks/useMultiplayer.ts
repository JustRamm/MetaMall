import { useState, useEffect, useCallback } from 'react';
import { supabase, UserPresence } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseMultiplayerOptions {
    userId: string;
    username: string;
    initialPosition?: { x: number; y: number };
    avatarType?: string;
}

interface PlayerData {
    userId: string;
    username: string;
    position: { x: number; y: number };
    direction: string;
    isMoving: boolean;
    avatarType: string;
}

export const useMultiplayer = ({
    userId,
    username,
    initialPosition = { x: 0, y: 0 },
    avatarType = 'default',
}: UseMultiplayerOptions) => {
    const [otherPlayers, setOtherPlayers] = useState<Map<string, PlayerData>>(new Map());
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    // Initialize user presence in database
    const initializePresence = useCallback(async () => {
        try {
            // Check if user exists in users table
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking user:', checkError);
            }

            // If user doesn't exist, create them
            if (!existingUser) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        username: username,
                        avatar_type: avatarType,
                    });

                if (insertError) {
                    console.error('Error creating user:', insertError);
                }
            } else {
                // Update avatar type if changed
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ avatar_type: avatarType, updated_at: new Date().toISOString() })
                    .eq('id', userId);

                if (updateError) {
                    console.error('Error updating user:', updateError);
                }
            }

            // Upsert user presence
            const { error: presenceError } = await supabase
                .from('user_presence')
                .upsert({
                    user_id: userId,
                    username: username,
                    position_x: initialPosition.x,
                    position_y: initialPosition.y,
                    direction: 'down',
                    is_moving: false,
                    last_seen: new Date().toISOString(),
                });

            if (presenceError) {
                console.error('Error initializing presence:', presenceError);
            }
        } catch (error) {
            console.error('Error in initializePresence:', error);
        }
    }, [userId, username, initialPosition, avatarType]);

    // Update player position
    const updatePosition = useCallback(async (
        x: number,
        y: number,
        direction: string,
        isMoving: boolean
    ) => {
        try {
            const { error } = await supabase
                .from('user_presence')
                .update({
                    position_x: x,
                    position_y: y,
                    direction: direction,
                    is_moving: isMoving,
                    last_seen: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) {
                console.error('Error updating position:', error);
            }
        } catch (error) {
            console.error('Error in updatePosition:', error);
        }
    }, [userId]);

    // Update avatar type
    const updateAvatarType = useCallback(async (newAvatarType: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ avatar_type: newAvatarType, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) {
                console.error('Error updating avatar type:', error);
            }
        } catch (error) {
            console.error('Error in updateAvatarType:', error);
        }
    }, [userId]);

    // Fetch all other players
    const fetchOtherPlayers = useCallback(async () => {
        try {
            const { data: presenceData, error: presenceError } = await supabase
                .from('user_presence')
                .select('*')
                .neq('user_id', userId);

            if (presenceError) {
                console.error('Error fetching presence:', presenceError);
                return;
            }

            // Fetch user data to get avatar types
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, avatar_type')
                .neq('id', userId);

            if (userError) {
                console.error('Error fetching users:', userError);
                return;
            }

            // Create a map of user IDs to avatar types
            const avatarMap = new Map(userData?.map(u => [u.id, u.avatar_type]) || []);

            // Combine presence and user data
            const players = new Map<string, PlayerData>();
            presenceData?.forEach((presence: UserPresence) => {
                players.set(presence.user_id, {
                    userId: presence.user_id,
                    username: presence.username,
                    position: { x: presence.position_x, y: presence.position_y },
                    direction: presence.direction,
                    isMoving: presence.is_moving,
                    avatarType: avatarMap.get(presence.user_id) || 'default',
                });
            });

            setOtherPlayers(players);
        } catch (error) {
            console.error('Error in fetchOtherPlayers:', error);
        }
    }, [userId]);

    // Set up real-time subscriptions
    useEffect(() => {
        initializePresence();
        fetchOtherPlayers();

        // Subscribe to presence changes
        const presenceChannel = supabase
            .channel('user-presence-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_presence',
                },
                async (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setOtherPlayers(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(payload.old.user_id);
                            return newMap;
                        });
                    } else if (payload.new && payload.new.user_id !== userId) {
                        // Fetch avatar type for this user
                        const { data: userData } = await supabase
                            .from('users')
                            .select('avatar_type')
                            .eq('id', payload.new.user_id)
                            .single();

                        const presence = payload.new as UserPresence;
                        setOtherPlayers(prev => {
                            const newMap = new Map(prev);
                            newMap.set(presence.user_id, {
                                userId: presence.user_id,
                                username: presence.username,
                                position: { x: presence.position_x, y: presence.position_y },
                                direction: presence.direction,
                                isMoving: presence.is_moving,
                                avatarType: userData?.avatar_type || 'default',
                            });
                            return newMap;
                        });
                    }
                }
            )
            .subscribe();

        setChannel(presenceChannel);

        // Heartbeat to update last_seen
        const heartbeatInterval = setInterval(() => {
            supabase
                .from('user_presence')
                .update({ last_seen: new Date().toISOString() })
                .eq('user_id', userId)
                .then(({ error }) => {
                    if (error) console.error('Heartbeat error:', error);
                });
        }, 5000); // Update every 5 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeatInterval);

            if (channel) {
                supabase.removeChannel(channel);
            }

            // Remove user presence on disconnect
            supabase
                .from('user_presence')
                .delete()
                .eq('user_id', userId)
                .then(({ error }) => {
                    if (error) console.error('Error removing presence:', error);
                });
        };
    }, [userId, username, initializePresence, fetchOtherPlayers]);

    return {
        otherPlayers: Array.from(otherPlayers.values()),
        updatePosition,
        updateAvatarType,
    };
};
