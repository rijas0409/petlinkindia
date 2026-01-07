import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import PetSelectionScreen from "@/components/shop/PetSelectionScreen";
import CategorySelectionScreen from "@/components/shop/CategorySelectionScreen";
import ProductListingScreen from "@/components/shop/ProductListingScreen";

type ShopScreen = "pet-selection" | "category-selection" | "product-listing";

const Shop = () => {
  const [currentScreen, setCurrentScreen] = useState<ShopScreen>("pet-selection");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<string[]>([]);

  const handleSelectPet = (petId: string) => {
    setSelectedPet(petId);
    setCurrentScreen("category-selection");
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScreen("product-listing");
  };

  const handleBackFromCategory = () => {
    setCurrentScreen("pet-selection");
    setSelectedPet("");
  };

  const handleBackFromProducts = () => {
    setCurrentScreen("category-selection");
    setSelectedCategory("");
  };

  const handleAddToCart = (productId: string) => {
    setCart(prev => [...prev, productId]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cart Badge - Floating */}
      {cart.length > 0 && currentScreen !== "pet-selection" && (
        <div className="fixed top-4 right-4 z-50">
          <Button variant="default" size="icon" className="rounded-full relative shadow-lg">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          </Button>
        </div>
      )}

      {currentScreen === "pet-selection" && (
        <PetSelectionScreen onSelectPet={handleSelectPet} />
      )}

      {currentScreen === "category-selection" && (
        <CategorySelectionScreen
          petType={selectedPet}
          onBack={handleBackFromCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {currentScreen === "product-listing" && (
        <ProductListingScreen
          petType={selectedPet}
          category={selectedCategory}
          onBack={handleBackFromProducts}
          onAddToCart={handleAddToCart}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Shop;
