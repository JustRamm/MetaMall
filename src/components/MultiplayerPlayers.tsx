import React from 'react';
import HumanAvatar from './HumanAvatar';
import { Text } from '@react-three/drei';

interface MultiplayerPlayersProps {
    players: Array<{
        userId: string;
        username: string;
        position: { x: number; y: number };
        direction: string;
        isMoving: boolean;
        avatarType: string;
    }>;
}

const MultiplayerPlayers: React.FC<MultiplayerPlayersProps> = ({ players }) => {
    return (
        <group>
            {players.map((player) => (
                <group key={player.userId}>
                    <HumanAvatar
                        position={[player.position.x, 0, player.position.y]}
                        avatarType={player.avatarType}
                        isMoving={player.isMoving}
                        direction={player.direction}
                        username={player.username}
                        isCurrentUser={false}
                    />
                    {/* Username label above avatar */}
                    <Text
                        position={[player.position.x, 2.5, player.position.y]}
                        fontSize={0.3}
                        color="#2196F3"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                    >
                        {player.username}
                    </Text>
                </group>
            ))}
        </group>
    );
};

export default MultiplayerPlayers;
