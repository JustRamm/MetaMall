import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import './CartPanel.css';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    product?: {
        name: string;
        price: number;
        image_url?: string;
    };
}

interface CartPanelProps {
    cartItems: CartItem[];
    totalItems: number;
    totalPrice: number;
    onUpdateQuantity: (cartItemId: string, quantity: number) => void;
    onRemoveItem: (cartItemId: string) => void;
    onClearCart: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
    cartItems,
    totalItems,
    totalPrice,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Cart Icon Button */}
            <button className="cart-icon-btn" onClick={() => setIsOpen(!isOpen)}>
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                    <span className="cart-badge">{totalItems}</span>
                )}
            </button>

            {/* Cart Panel */}
            {isOpen && (
                <div className="cart-panel-overlay" onClick={() => setIsOpen(false)}>
                    <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header">
                            <h2>Shopping Cart</h2>
                            <button className="cart-close-btn" onClick={() => setIsOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="cart-content">
                            {cartItems.length === 0 ? (
                                <div className="cart-empty">
                                    <ShoppingCart size={64} />
                                    <p>Your cart is empty</p>
                                    <span>Add some products to get started!</span>
                                </div>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="cart-item">
                                                <div className="cart-item-image">
                                                    {item.product?.image_url ? (
                                                        <img src={item.product.image_url} alt={item.product.name} />
                                                    ) : (
                                                        <div className="cart-item-placeholder">
                                                            <ShoppingCart size={24} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="cart-item-details">
                                                    <h3>{item.product?.name || 'Product'}</h3>
                                                    <p className="cart-item-price">
                                                        ${Number(item.product?.price || 0).toFixed(2)}
                                                    </p>

                                                    <div className="cart-item-quantity">
                                                        <button
                                                            className="quantity-btn-small"
                                                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button
                                                            className="quantity-btn-small"
                                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="cart-item-actions">
                                                    <div className="cart-item-total">
                                                        ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                                                    </div>
                                                    <button
                                                        className="cart-item-remove"
                                                        onClick={() => onRemoveItem(item.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cart-footer">
                                        <div className="cart-total">
                                            <span>Total:</span>
                                            <span className="cart-total-price">${totalPrice.toFixed(2)}</span>
                                        </div>

                                        <button className="cart-checkout-btn">
                                            Proceed to Checkout
                                        </button>

                                        <button className="cart-clear-btn" onClick={onClearCart}>
                                            Clear Cart
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartPanel;
