import React, { useState } from 'react';
import { Palette, X, Check } from 'lucide-react';
import { AVATAR_CONFIGS } from './HumanAvatar';
import './AvatarCustomizer.css';

interface AvatarCustomizerProps {
    currentAvatarType: string;
    onAvatarChange: (avatarType: string) => void;
    username: string;
}

const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
    currentAvatarType,
    onAvatarChange,
    username,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const avatarTypes = [
        { id: 'default', name: 'Default', emoji: '👤' },
        { id: 'sporty', name: 'Sporty', emoji: '⚽' },
        { id: 'elegant', name: 'Elegant', emoji: '👔' },
        { id: 'casual', name: 'Casual', emoji: '👕' },
        { id: 'professional', name: 'Professional', emoji: '💼' },
        { id: 'vibrant', name: 'Vibrant', emoji: '🌈' },
    ];

    const handleAvatarSelect = (avatarType: string) => {
        onAvatarChange(avatarType);
        setIsOpen(false);
    };

    return (
        <>
            {/* Customize Button - Bottom Left Corner */}
            <button
                className="avatar-customize-button"
                onClick={() => setIsOpen(!isOpen)}
                title="Customize Avatar"
            >
                <Palette size={24} />
                <span className="customize-label">Customize</span>
            </button>

            {/* Customization Panel */}
            {isOpen && (
                <div className="avatar-customizer-overlay" onClick={() => setIsOpen(false)}>
                    <div className="avatar-customizer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="customizer-header">
                            <h2>Customize Your Avatar</h2>
                            <button className="close-button" onClick={() => setIsOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="customizer-content">
                            <div className="user-info">
                                <div className="username-display">
                                    <span className="username-label">Playing as:</span>
                                    <span className="username-value">{username}</span>
                                </div>
                            </div>

                            <div className="avatar-grid">
                                {avatarTypes.map((avatar) => {
                                    const config = AVATAR_CONFIGS[avatar.id as keyof typeof AVATAR_CONFIGS];
                                    const isSelected = currentAvatarType === avatar.id;

                                    return (
                                        <div
                                            key={avatar.id}
                                            className={`avatar-option ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleAvatarSelect(avatar.id)}
                                        >
                                            {isSelected && (
                                                <div className="selected-indicator">
                                                    <Check size={20} />
                                                </div>
                                            )}

                                            <div className="avatar-emoji">{avatar.emoji}</div>
                                            <div className="avatar-name">{avatar.name}</div>

                                            <div className="avatar-preview">
                                                <div className="color-swatch-row">
                                                    <div
                                                        className="color-swatch"
                                                        style={{ backgroundColor: config.shirtColor }}
                                                        title="Shirt"
                                                    />
                                                    <div
                                                        className="color-swatch"
                                                        style={{ backgroundColor: config.pantsColor }}
                                                        title="Pants"
                                                    />
                                                    <div
                                                        className="color-swatch"
                                                        style={{ backgroundColor: config.hairColor }}
                                                        title="Hair"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="customizer-footer">
                                <p className="hint-text">
                                    💡 Your avatar will be visible to all other shoppers in real-time!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AvatarCustomizer;
