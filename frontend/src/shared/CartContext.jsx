import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
	const [cartItems, setCartItems] = useState(() => {
		const saved = localStorage.getItem('cart');
		return saved ? JSON.parse(saved) : [];
	});

	useEffect(() => {
		localStorage.setItem('cart', JSON.stringify(cartItems));
	}, [cartItems]);

	function addToCart(order) {
		// Allow confirmed orders and buy_now orders with pending_advance status
		const allowedStatuses = ['confirmed', 'pending_advance', 'advance_paid'];
		if (!allowedStatuses.includes(order.status)) {
			return false;
		}
		
		// Check if order already exists in cart
		if (cartItems.some(item => item._id === order._id)) {
			return false;
		}
		
		setCartItems([...cartItems, order]);
		return true;
	}

	function removeFromCart(orderId) {
		setCartItems(cartItems.filter(item => item._id !== orderId));
	}

	function clearCart() {
		setCartItems([]);
	}

	function getCartTotal() {
		return cartItems.reduce((sum, item) => sum + (item.amount || 0), 0);
	}

	function getCartCount() {
		return cartItems.length;
	}

	return (
		<CartContext.Provider value={{
			cartItems,
			addToCart,
			removeFromCart,
			clearCart,
			getCartTotal,
			getCartCount,
		}}>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	return useContext(CartContext);
}

