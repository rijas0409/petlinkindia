import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import DeliveryAuth from "./pages/DeliveryAuth";
import BuyerDashboard from "./pages/BuyerDashboard";
import BuyerProfile from "./pages/BuyerProfile";
import SellerDashboard from "./pages/SellerDashboard";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerProfile from "./pages/SellerProfile";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import PetDetails from "./pages/PetDetails";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminDashboard from "./pages/AdminDashboard";
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
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/delivery-auth" element={<DeliveryAuth />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer-profile" element={<BuyerProfile />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/seller-onboarding" element={<SellerOnboarding />} />
          <Route path="/seller-profile" element={<SellerProfile />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/edit-pet/:id" element={<EditPet />} />
          <Route path="/pet/:id" element={<PetDetails />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
