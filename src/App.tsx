import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthBuyer from "./pages/AuthBuyer";
import AuthBreeder from "./pages/AuthBreeder";
import AuthDelivery from "./pages/AuthDelivery";
import AuthAdmin from "./pages/AuthAdmin";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerPendingApproval from "./pages/SellerPendingApproval";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import PetDetails from "./pages/PetDetails";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileMenu from "./pages/ProfileMenu";
import Shop from "./pages/Shop";
import Chats from "./pages/Chats";
import Wishlist from "./pages/Wishlist";
import Vet from "./pages/Vet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-buyer" element={<AuthBuyer />} />
          <Route path="/auth-breeder" element={<AuthBreeder />} />
          <Route path="/auth-delivery" element={<AuthDelivery />} />
          <Route path="/auth-admin" element={<AuthAdmin />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/seller-onboarding" element={<SellerOnboarding />} />
          <Route path="/seller-pending-approval" element={<SellerPendingApproval />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/edit-pet/:id" element={<EditPet />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile-menu" element={<ProfileMenu />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/vet" element={<Vet />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
