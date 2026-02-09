import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";
import ShopHomeScreen from "@/components/shop/ShopHomeScreen";
import PetShopScreen from "@/components/shop/PetShopScreen";
import ProductListingScreen from "@/components/shop/ProductListingScreen";
import { useCart } from "@/contexts/CartContext";

type ShopScreen = "home" | "pet-shop" | "product-listing";

const Shop = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<ShopScreen>("home");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const { addToCart: handleAddToCart } = useCart();

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
