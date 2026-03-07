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
import ProfileSettings from "./pages/ProfileSettings";
import Addresses from "./pages/Addresses";
import WalletPage from "./pages/WalletPage";
import Bookings from "./pages/Bookings";
import Notifications from "./pages/Notifications";
import PrivacySecurity from "./pages/PrivacySecurity";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import Chats from "./pages/Chats";
import Wishlist from "./pages/Wishlist";
import Vet from "./pages/Vet";
import ConsultationPlan from "./pages/vet/ConsultationPlan";
import PaymentSummary from "./pages/vet/PaymentSummary";
import PaymentFailed from "./pages/vet/PaymentFailed";
import FindingVet from "./pages/vet/FindingVet";
import ConnectionReady from "./pages/vet/ConnectionReady";
import VideoCall from "./pages/vet/VideoCall";
import DigitalPrescription from "./pages/vet/DigitalPrescription";
import AIVetAssistant from "./pages/vet/AIVetAssistant";
import AIVetAssessment from "./pages/vet/AIVetAssessment";
import AIAnalyzingCondition from "./pages/vet/AIAnalyzingCondition";
import BookingDetails from "./pages/vet/BookingDetails";
import PreparingPrescription from "./pages/vet/PreparingPrescription";
import NotFound from "./pages/NotFound";
import AuthProducts from "./pages/AuthProducts";
import ProductsOnboarding from "./pages/ProductsOnboarding";
import ProductsPendingApproval from "./pages/ProductsPendingApproval";
import ProductsDashboard from "./pages/ProductsDashboard";
import AddProduct from "./pages/AddProduct";
import ProductProfile from "./pages/ProductProfile";
import AuthVet from "./pages/AuthVet";
import VetOnboarding from "./pages/VetOnboarding";
import VetPendingApproval from "./pages/VetPendingApproval";
import VetDashboard from "./pages/VetDashboard";
import { CartProvider } from "./contexts/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <CartProvider>
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
              <Route path="/profile/settings" element={<ProfileSettings />} />
              <Route path="/profile/addresses" element={<Addresses />} />
              <Route path="/profile/wallet" element={<WalletPage />} />
              <Route path="/profile/bookings" element={<Bookings />} />
              <Route path="/profile/notifications" element={<Notifications />} />
              <Route path="/profile/privacy" element={<PrivacySecurity />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/vet" element={<Vet />} />
              <Route path="/vet/consultation-plan" element={<ConsultationPlan />} />
              <Route path="/vet/payment-summary" element={<PaymentSummary />} />
              <Route path="/vet/payment-failed" element={<PaymentFailed />} />
              <Route path="/vet/finding-vet" element={<FindingVet />} />
              <Route path="/vet/connection-ready" element={<ConnectionReady />} />
              <Route path="/vet/video-call" element={<VideoCall />} />
              <Route path="/vet/preparing-prescription" element={<PreparingPrescription />} />
              <Route path="/vet/prescription" element={<DigitalPrescription />} />
              <Route path="/vet/ai-assistant" element={<AIVetAssistant />} />
              <Route path="/vet/ai-assessment" element={<AIVetAssessment />} />
              <Route path="/vet/ai-analyzing" element={<AIAnalyzingCondition />} />
              <Route path="/vet/booking-details" element={<BookingDetails />} />
              <Route path="/auth-products" element={<AuthProducts />} />
              <Route path="/products-onboarding" element={<ProductsOnboarding />} />
              <Route path="/products-pending-approval" element={<ProductsPendingApproval />} />
              <Route path="/products-dashboard" element={<ProductsDashboard />} />
              <Route path="/add-product" element={<AddProduct />} />
              <Route path="/product/:id" element={<ProductProfile />} />
              <Route path="/auth-vet" element={<AuthVet />} />
              <Route path="/vet-onboarding" element={<VetOnboarding />} />
              <Route path="/vet-pending-approval" element={<VetPendingApproval />} />
              <Route path="/vet-dashboard" element={<VetDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;

