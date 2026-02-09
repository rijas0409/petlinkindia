import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import ShopHomeScreen from "@/components/shop/ShopHomeScreen";
import PetShopScreen from "@/components/shop/PetShopScreen";
import ProductListingScreen from "@/components/shop/ProductListingScreen";
import { toast } from "sonner";

type ShopScreen = "home" | "pet-shop" | "product-listing";

interface CartItem {
  productId: string;
  quantity: number;
}

const Shop = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<ShopScreen>("home");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleSelectPet = (petId: string) => {
    setSelectedPet(petId);
    setCurrentScreen("pet-shop");
  };

  const handleBackFromPetShop = () => {
    setCurrentScreen("home");
    setSelectedPet("");
  };

  const handleViewAllProducts = () => {
    setCurrentScreen("product-listing");
  };

  const handleBackFromProducts = () => {
    setCurrentScreen("pet-shop");
  };

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    toast.success("Added to cart");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {currentScreen === "home" && (
        <ShopHomeScreen onSelectPet={handleSelectPet} onAddToCart={handleAddToCart} />
      )}

      {currentScreen === "pet-shop" && (
        <PetShopScreen
          petType={selectedPet}
          onBack={handleBackFromPetShop}
          onViewAllProducts={handleViewAllProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      {currentScreen === "product-listing" && (
        <ProductListingScreen
          petType={selectedPet}
          onBack={handleBackFromProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Shop;
