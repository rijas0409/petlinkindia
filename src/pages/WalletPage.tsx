import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

const WalletPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const uid = session.user.id;

      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", uid).maybeSingle();
      if (wallet) {
        setBalance(wallet.balance || 0);
        const { data: txs } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", wallet.id)
          .order("created_at", { ascending: false });
        setTransactions(txs || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Wallet</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        <Card className="p-6 rounded-2xl border-0 bg-gradient-primary text-white">
          <p className="text-sm opacity-80">Available Balance</p>
          <h2 className="text-3xl font-bold mt-1">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
          <Button variant="secondary" size="sm" className="mt-4 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Money
          </Button>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Recent Transactions</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any) => (
                <Card key={tx.id} className="p-4 rounded-2xl border-0 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{tx.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
