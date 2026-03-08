import { AdminData } from "@/pages/AdminDashboard";
import { DollarSign, TrendingUp, ArrowDownRight } from "lucide-react";

interface Props {
  data: AdminData;
}

const AdminFinancials = ({ data }: Props) => {
  const totalSellerEarnings = data.sellerEarnings.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const totalVetEarnings = data.vetEarnings.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const totalCommission = data.sellerEarnings.reduce((s: number, e: any) => s + (e.commission || 0), 0) + data.vetEarnings.reduce((s: number, e: any) => s + (e.commission || 0), 0);
  const totalPending = [...data.sellerEarnings, ...data.vetEarnings].filter((e: any) => e.payout_status === "pending").reduce((s: number, e: any) => s + (e.net_amount || 0), 0);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const allEarnings = [
    ...data.sellerEarnings.map((e: any) => ({ ...e, source: "Seller" })),
    ...data.vetEarnings.map((e: any) => ({ ...e, source: "Vet" })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Financials</h1>
        <p className="text-sm text-[hsl(220,15%,55%)] mt-1">Revenue, commissions and payout overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Revenue", value: fmt(totalSellerEarnings + totalVetEarnings), color: "hsl(220,80%,50%)" },
          { label: "Platform Commission", value: fmt(totalCommission), color: "hsl(145,60%,45%)" },
          { label: "Pending Payouts", value: fmt(totalPending), color: "hsl(35,90%,50%)" },
          { label: "Vet Earnings", value: fmt(totalVetEarnings), color: "hsl(270,60%,55%)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-5">
            <p className="text-[13px] text-[hsl(220,15%,55%)] font-medium">{s.label}</p>
            <p className="text-[28px] font-bold text-[hsl(220,20%,15%)] mt-1">{s.value}</p>
            <div className="mt-3 h-1 rounded-full bg-[hsl(220,20%,94%)]">
              <div className="h-full rounded-full w-3/5" style={{ backgroundColor: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        <h2 className="text-lg font-bold text-[hsl(220,20%,15%)] mb-5">Earnings & Payouts</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(220,20%,92%)]">
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Source</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Amount</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Commission</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Net</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Status</th>
              <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Date</th>
            </tr>
          </thead>
          <tbody>
            {allEarnings.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-[hsl(220,15%,60%)]">No earnings data yet</td></tr>
            ) : (
              allEarnings.slice(0, 30).map((e: any) => (
                <tr key={e.id} className="border-b border-[hsl(220,20%,95%)] hover:bg-[hsl(220,20%,98%)]">
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${e.source === "Vet" ? "bg-[hsl(270,40%,93%)] text-[hsl(270,60%,45%)]" : "bg-[hsl(220,40%,93%)] text-[hsl(220,60%,40%)]"}`}>{e.source}</span>
                  </td>
                  <td className="py-3 font-medium text-[hsl(220,20%,15%)]">{fmt(e.amount)}</td>
                  <td className="py-3 text-[hsl(220,15%,45%)]">{fmt(e.commission)}</td>
                  <td className="py-3 font-semibold text-[hsl(145,60%,35%)]">{fmt(e.net_amount)}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      e.payout_status === "paid" ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" :
                      "bg-[hsl(40,60%,92%)] text-[hsl(40,70%,35%)]"
                    }`}>{e.payout_status}</span>
                  </td>
                  <td className="py-3 text-[hsl(220,15%,60%)]">{new Date(e.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinancials;
