import { useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import PetSelectionScreen from "@/components/shop/PetSelectionScreen";
import ProductListingScreen from "@/components/shop/ProductListingScreen";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

type ShopScreen = "pet-selection" | "product-listing";

interface CartItem {
  productId: string;
  quantity: number;
}

const Shop = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<ShopScreen>("pet-selection");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { totalWishlistCount } = useWishlist();

  const handleSelectPet = (petId: string) => {
    setSelectedPet(petId);
    setCurrentScreen("product-listing");
  };

  const handleBackFromProducts = () => {
    setCurrentScreen("pet-selection");
    setSelectedPet("");
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

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Actions - Floating */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Wishlist Button */}
        <Button
          variant="default"
          size="icon"
          className="rounded-full relative shadow-lg"
          onClick={() => navigate("/wishlist")}
        >
          <Heart className="w-5 h-5" />
          {totalWishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {totalWishlistCount}
            </span>
          )}
        </Button>

        {/* Cart Button */}
        {totalCartItems > 0 && (
          <Button
            variant="default"
            size="icon"
            className="rounded-full relative shadow-lg"
            onClick={() => toast.info("Cart checkout coming soon")}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {totalCartItems}
            </span>
          </Button>
        )}
      </div>

      {currentScreen === "pet-selection" && (
        <PetSelectionScreen onSelectPet={handleSelectPet} />
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
