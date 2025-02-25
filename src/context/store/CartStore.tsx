"use client";
import { ICart, ICartStore, IWishList } from "@/types/types";
import { useUser } from "@clerk/nextjs";

import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

const CartContext = createContext<ICartStore | undefined>(undefined);

const CartStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [cart, setCart] = useState<ICart[]>([]);
  const [wishList, setWishList] = useState<IWishList[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Load cart data from localStorage when component mounts
  useEffect(() => {
    const loadCart = () => {
      if (user?.id) {
        const storedCart = localStorage.getItem(`cart_${user.id}`);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      }
    };
    loadCart();
  }, [user?.id]); // Only run when user ID changes

  // Update localStorage whenever cart and wishlist changes
  useEffect(() => {
    if (user?.id && cart.length > 0) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishList));
    }
  }, [cart, user?.id, wishList]);

  // Calculate total amount whenever cart changes
  useEffect(() => {
    const calculateTotalAmount = () => {
      const total = cart.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
      );
      setTotalAmount(total);
    };
    calculateTotalAmount();
  }, [cart]);

  const addToWishList = async (newItem: {
    id: string;
    name: string;
    imagePath: string;
    price: string;
  }) => {
    try {
      if (!user?.id) {
        toast.error("Please login to add items to wishlist");
        window.location.replace("/sign-in");
        return;
      }

      const chrs =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const nanoId = (len: number) =>
        [...Array(len)]
          .map(() => chrs[Math.floor(Math.random() * chrs.length)])
          .join("");
      const wishListId = nanoId(10);

      const existingItemIndex = wishList.findIndex(
        (w) => w.productId === newItem.id
      );

      if (existingItemIndex !== -1) {
        toast.success("Item Already in wishlist");
      } else {
        const Item: IWishList = {
          id: wishListId,
          userId: user.id,
          productId: newItem.id,
          productTitle: newItem.name,
          productImage: newItem.imagePath,
          productPrice: Number(newItem.price),
        };
        setWishList((prevCart) => [...prevCart, Item]);
        toast.success("Item added to Wishlist");
      }
    } catch (error) {
      console.error("Error adding to WishList:", error);
      toast.error("Failed to add item to Wishlist");
    }
  };
  const addToCart = async (newItem: {
    id: string;
    name: string;
    imagePath: string;
    price: string;
    description: string;
    discountPercentage: string;
    isFeaturedProduct: boolean;
    stockLevel: number;
    category: string;
    color: string;
    size: string;
    images: { url: string }[];
    quantity: number;
  }) => {
    try {
      if (!user?.id) {
        toast.error("Please login to add items to cart");
        window.location.replace("/sign-in");
        return;
      }

      const chrs =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const nanoId = (len: number) =>
        [...Array(len)]
          .map(() => chrs[Math.floor(Math.random() * chrs.length)])
          .join("");
      const cartId = nanoId(10);

      const existingItemIndex = cart.findIndex(
        (c) => c.productId === newItem.id
      );

      if (existingItemIndex !== -1) {
        if (cart[existingItemIndex].quantity >= newItem.stockLevel) {
          toast.error("Product is out of stock");
          return;
        }
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        setCart(updatedCart);
        toast.success("Item quantity updated in cart");
      } else {
        const Item: ICart = {
          id: cartId,
          userId: user.id,
          productId: newItem.id,
          productTitle: newItem.name,
          productImage: newItem.imagePath,
          productPrice: Number(newItem.price),
          productStock: newItem.stockLevel,
          quantity: newItem.quantity,
          productColor: newItem.color,
          productSize: newItem.size,
        };
        setCart((prevCart) => [...prevCart, Item]);
        toast.success("Item added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user?.id) {
        toast.error("Please login to remove items from cart");
        window.location.replace("/sign-in");
        return;
      }
      const updatedCarts = cart.filter((item) => item.id !== itemId);

      setCart(updatedCarts);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCarts));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };
  const removeFromWishList = async (itemId: string) => {
    try {
      if (!user?.id) {
        toast.error("Please login to remove items from Wishlist");
        window.location.replace("/sign-in");
        return;
      }
      const updatedWishList = wishList.filter((item) => item.id !== itemId);

      setWishList(updatedWishList);
      localStorage.setItem(
        `wishlist_${user.id}`,
        JSON.stringify(updatedWishList)
      );
      toast.success("Item removed from Wishlist");
    } catch (error) {
      console.error("Error removing from WishList:", error);
      toast.error("Failed to remove item from WishList");
    }
  };

  const handleCartDecrement = async (id: string) => {
    const cartItem = cart.find((item) => item.id === id);

    if (!cartItem) {
      console.error("Cart item not found");
      return;
    }

    if (cartItem.quantity <= 1) {
      toast.error("Minimum quantity reached");
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
    toast.success("Item quantity decreased");
  };

  const handleCartIncrement = async (id: string) => {
    const cartItem = cart.find((item) => item.id === id);

    if (!cartItem) {
      console.error("Cart item not found");
      return;
    }

    if (cartItem.quantity >= cartItem.productStock) {
      toast.error("Product is out of stock");
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    toast.success("Item quantity increased");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        totalAmount,
        handleCartIncrement,
        handleCartDecrement,
        wishList,
        addToWishList,
        removeFromWishList,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartStore;

export const useCartStore = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartStore must be used within a CartStore");
  }
  return context;
};
