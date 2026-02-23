import { useState, useEffect } from "react";
import { MapPin, Truck, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DeliveryDetailsCardProps {
  city: string;
  state: string;
}

interface Address {
  id: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const DeliveryDetailsCard = ({ city, state }: DeliveryDetailsCardProps) => {
  const [address, setAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ address_line: "", city: "", state: "", pincode: "" });

  useEffect(() => {
    fetchDefaultAddress();
  }, []);

  const fetchDefaultAddress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_default", true)
      .single();

    if (data) {
      setAddress(data);
    } else {
      // Try any address
      const { data: anyAddr } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (anyAddr) setAddress(anyAddr);
    }
    setLoading(false);
  };

  const handleSaveAddress = async () => {
    if (!form.address_line || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all fields");
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: session.user.id,
        address_line: form.address_line,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        is_default: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save address");
    } else {
      setAddress(data);
      setShowForm(false);
      toast.success("Address saved!");
    }
    setSaving(false);
  };

  const displayAddress = address
    ? `${address.address_line}, ${address.city}`
    : null;

  return (
    <div className="px-5 py-4">
      <h3 className="font-bold text-[17px] text-[#151B32] mb-3">Delivery Details</h3>
      <div className="rounded-2xl border border-[#ECECEC] bg-white overflow-hidden">
        {/* Delivery address row */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
          onClick={() => { if (!displayAddress) setShowForm(true); }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#818CF8]" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">DELIVERY ADDRESS</p>
              <p className="text-[12px] text-[#151B32]">
                {displayAddress || "Tap to add delivery address"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#999]" />
        </div>

        {/* Address Form */}
        {showForm && !displayAddress && (
          <div className="border-t border-[#F0F0F0] px-4 py-3 space-y-3">
            <div>
              <Label className="text-xs">Address Line *</Label>
              <Input placeholder="House No., Street, Area" value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="rounded-xl h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">City *</Label>
                <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs">State *</Label>
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-xl h-9 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Pincode *</Label>
              <Input placeholder="400001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="rounded-xl h-9 text-sm" />
            </div>
            <Button onClick={handleSaveAddress} disabled={saving} size="sm" className="w-full rounded-xl bg-gradient-primary">
              {saving ? "Saving..." : "Save Address"}
            </Button>
          </div>
        )}

        <div className="border-t border-[#F0F0F0] mx-4" />

        {/* Express delivery row */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
            <Truck className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">EXPRESS DELIVERY</p>
            <p className="text-[12px] text-[#151B32]">Arriving in 2 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsCard;
