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
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>("");
  const { addToCart: handleAddToCart } = useCart();

  const handleSelectPet = (petId: string) => {
    setSelectedPet(petId);
    setCurrentScreen("pet-shop");
  };

  const handleBackFromPetShop = () => {
    setCurrentScreen("home");
    setSelectedPet("");
  };

  const handleViewAllProducts = (breed?: string) => {
    setSelectedBreed(breed || "");
    setInitialSearchQuery("");
    setCurrentScreen("product-listing");
  };

  const handleSearchFromShop = (query: string, petType?: string) => {
    if (petType) setSelectedPet(petType);
    setSelectedBreed("");
    setInitialSearchQuery(query);
    setCurrentScreen("product-listing");
  };

  const handleBackFromProducts = () => {
    setSelectedBreed("");
    setInitialSearchQuery("");
    setCurrentScreen("pet-shop");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {currentScreen === "home" && (
        <ShopHomeScreen
          onSelectPet={handleSelectPet}
          onAddToCart={handleAddToCart}
          onSearch={(query) => handleSearchFromShop(query, "dog")}
        />
      )}

      {currentScreen === "pet-shop" && (
        <PetShopScreen
          petType={selectedPet}
          onBack={handleBackFromPetShop}
          onViewAllProducts={handleViewAllProducts}
          onAddToCart={handleAddToCart}
          onSearch={(query) => handleSearchFromShop(query, selectedPet)}
        />
      )}

      {currentScreen === "product-listing" && (
        <ProductListingScreen
          petType={selectedPet}
          initialBreed={selectedBreed}
          initialSearch={initialSearchQuery}
          onBack={handleBackFromProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Shop;
