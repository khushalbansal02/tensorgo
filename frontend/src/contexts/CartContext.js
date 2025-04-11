import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (plan, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.plan._id === plan._id);
      if (existingItem) {
        return prev.map(item =>
          item.plan._id === plan._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { plan, quantity }];
    });
  };

  const removeFromCart = (planId) => {
    setCartItems(prev => prev.filter(item => item.plan._id !== planId));
  };

  const updateQuantity = (planId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.plan._id === planId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.plan.price * item.quantity);
    }, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
