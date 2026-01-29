import React from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../lib/supabaseClient';
import './ProductDetailsModal.css';

interface ProductDetailsModalProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (productId: string, quantity: number) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
    product,
    onClose,
    onAddToCart,
}) => {
    const [quantity, setQuantity] = React.useState(1);

    if (!product) return null;

    const handleAddToCart = () => {
        onAddToCart(product.id, quantity);
        onClose();
    };

    const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10));
    const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="product-modal-content">
                    {/* Product Image Placeholder */}
                    <div className="product-image-section">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="product-image" />
                        ) : (
                            <div className="product-image-placeholder">
                                <ShoppingCart size={64} />
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="product-details-section">
                        <h2 className="product-title">{product.name}</h2>

                        <div className="product-category">
                            <span className="category-badge">{product.category}</span>
                        </div>

                        <div className="product-price">
                            ${Number(product.price).toFixed(2)}
                        </div>

                        {product.description && (
                            <div className="product-description">
                                <h3>Description</h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="quantity-section">
                            <h3>Quantity</h3>
                            <div className="quantity-controls">
                                <button
                                    className="quantity-btn"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="quantity-display">{quantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={incrementQuantity}
                                    disabled={quantity >= 10}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>
                            <ShoppingCart size={20} />
                            Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
