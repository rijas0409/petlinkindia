import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

const TRANSACTIONS = [
  { id: "1", type: "credit", title: "Refund - Order #1234", amount: 500, date: "Feb 5, 2026" },
  { id: "2", type: "debit", title: "Pet Food Purchase", amount: 899, date: "Feb 3, 2026" },
  { id: "3", type: "credit", title: "Cashback Reward", amount: 50, date: "Jan 28, 2026" },
  { id: "4", type: "debit", title: "Vet Consultation", amount: 500, date: "Jan 25, 2026" },
];

const WalletPage = () => {
  const navigate = useNavigate();

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
        {/* Balance Card */}
        <Card className="p-6 rounded-2xl border-0 bg-gradient-primary text-white">
          <p className="text-sm opacity-80">Available Balance</p>
          <h2 className="text-3xl font-bold mt-1">₹0.00</h2>
          <Button variant="secondary" size="sm" className="mt-4 rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Add Money
          </Button>
        </Card>

        {/* Transactions */}
        <div>
          <h3 className="font-semibold mb-3">Recent Transactions</h3>
          {TRANSACTIONS.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {TRANSACTIONS.map((tx) => (
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
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
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
