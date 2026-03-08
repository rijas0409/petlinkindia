import { AdminData } from "@/pages/AdminDashboard";
import { Users, Stethoscope, DollarSign, TrendingUp, Download, Power, CheckCircle2, XCircle, Eye, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";

interface Props {
  data: AdminData;
  actions: any;
  setActiveSection: (s: string) => void;
}

const chartData = [
  { name: "Week 1", value: 2400 },
  { name: "Week 2", value: 5800 },
  { name: "Week 3", value: 4600 },
  { name: "Week 4", value: 7200 },
  { name: "Week 5", value: 5200 },
  { name: "Week 6", value: 8400 },
  { name: "Week 7", value: 7800 },
];

const AdminOverview = ({ data, actions, setActiveSection }: Props) => {
  const [chartRange, setChartRange] = useState("30");

  const totalUsers = data.allUsers.length;
  const verifiedVets = data.allVets.filter((v: any) => v.verification_status === "verified").length;
  const totalRevenue = data.sellerEarnings.reduce((s: number, e: any) => s + (e.amount || 0), 0) + data.vetEarnings.reduce((s: number, e: any) => s + (e.amount || 0), 0);

  const pendingTasks = [
    ...data.pendingVets.map((v: any) => ({
      type: "vet" as const,
      title: "New Vet Verification",
      desc: `${v.profile?.name || "Doctor"} submitted credentials.`,
      time: getTimeAgo(v.created_at),
      color: "hsl(220,80%,50%)",
      id: v.user_id,
    })),
    ...data.pendingSellers.map((s: any) => ({
      type: "seller" as const,
      title: "Seller Verification",
      desc: `${s.full_name || s.name} awaiting approval.`,
      time: getTimeAgo(s.created_at),
      color: "hsl(35,90%,55%)",
      id: s.id,
    })),
    ...data.pendingPets.slice(0, 3).map((p: any) => ({
      type: "pet" as const,
      title: "Pet Listing Verification",
      desc: `${p.name} (${p.breed}) needs review.`,
      time: getTimeAgo(p.created_at),
      color: "hsl(145,60%,45%)",
      id: p.id,
    })),
    ...data.pendingProducts.slice(0, 3).map((p: any) => ({
      type: "product" as const,
      title: "Product Verification",
      desc: `${p.name} by ${p.seller?.name || "Unknown"}.`,
      time: getTimeAgo(p.created_at),
      color: "hsl(270,60%,55%)",
      id: p.id,
    })),
  ];

  const totalPending = pendingTasks.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[hsl(220,20%,15%)]">Global Overview</h1>
          <p className="text-[hsl(220,15%,55%)] text-sm mt-1">Command center for PetLink multi-service platform operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-[hsl(220,20%,88%)] rounded-xl text-sm font-medium text-[hsl(220,20%,20%)] bg-white hover:bg-[hsl(220,20%,97%)] transition-colors">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[hsl(220,20%,15%)] hover:bg-[hsl(220,20%,25%)] transition-colors">
            <Power className="w-4 h-4" /> Power Control
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Active Users"
          value={totalUsers.toLocaleString()}
          trend="+12.5%"
          trendUp
          icon={<Users className="w-6 h-6 text-[hsl(220,15%,70%)]" />}
          barColor="hsl(220,80%,50%)"
        />
        <StatCard
          label="Verified Vets"
          value={verifiedVets.toLocaleString()}
          trend="+5.2%"
          trendUp
          icon={<Stethoscope className="w-6 h-6 text-[hsl(145,60%,55%)]" />}
          barColor="hsl(145,60%,50%)"
        />
        <StatCard
          label="Gross Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          trend="+18.3%"
          trendUp
          icon={<DollarSign className="w-6 h-6 text-[hsl(220,15%,70%)]" />}
          barColor="hsl(220,80%,50%)"
        />
      </div>

      {/* Chart + Pending Tasks */}
      <div className="grid grid-cols-[1fr_380px] gap-6 mb-8">
        {/* Analytics Chart */}
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-[hsl(220,20%,15%)]">Platform Activity Analytics</h2>
              <p className="text-sm text-[hsl(220,15%,55%)]">Daily interactions across all platform services</p>
            </div>
            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              className="px-4 py-2 border border-[hsl(220,20%,88%)] rounded-xl text-sm bg-white text-[hsl(220,20%,20%)] focus:outline-none"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div className="h-[320px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220,80%,50%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(220,80%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220,15%,60%)" }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220,20%,92%)", fontSize: 13 }} />
                <Area type="monotone" dataKey="value" stroke="hsl(220,80%,50%)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 4, fill: "hsl(220,80%,50%)", strokeWidth: 2, stroke: "white" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-bold text-[hsl(220,20%,15%)]">Pending Tasks</h2>
            <span className="px-2.5 py-0.5 bg-[hsl(0,75%,55%)] text-white text-[11px] font-bold rounded-full">{totalPending}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {pendingTasks.length === 0 ? (
              <p className="text-center text-[hsl(220,15%,60%)] py-8 text-sm">No pending tasks 🎉</p>
            ) : (
              pendingTasks.slice(0, 6).map((task, i) => (
                <div key={i} className="relative pl-4 border-l-[3px] rounded-sm" style={{ borderColor: task.color }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(220,20%,15%)]">{task.title}</p>
                      <p className="text-[13px] text-[hsl(220,15%,55%)] mt-0.5">{task.desc}</p>
                    </div>
                    <span className="text-[11px] text-[hsl(220,15%,60%)] whitespace-nowrap ml-2">{task.time}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {task.type === "vet" && (
                      <>
                        <button onClick={() => actions.approveVet(task.id)} className="px-3 py-1.5 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)]">Approve</button>
                        <button onClick={() => setActiveSection("vets")} className="px-3 py-1.5 border border-[hsl(220,20%,88%)] text-[12px] font-medium rounded-lg text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">Review</button>
                      </>
                    )}
                    {task.type === "seller" && (
                      <>
                        <button onClick={() => actions.approveSeller(task.id)} className="px-3 py-1.5 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)]">Approve</button>
                        <button onClick={() => setActiveSection("users")} className="px-3 py-1.5 border border-[hsl(220,20%,88%)] text-[12px] font-medium rounded-lg text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">Review</button>
                      </>
                    )}
                    {task.type === "pet" && (
                      <>
                        <button onClick={() => actions.verifyPet(task.id)} className="px-3 py-1.5 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)]">Approve</button>
                        <button onClick={() => setActiveSection("listings")} className="px-3 py-1.5 border border-[hsl(220,20%,88%)] text-[12px] font-medium rounded-lg text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">Review</button>
                      </>
                    )}
                    {task.type === "product" && (
                      <>
                        <button onClick={() => actions.verifyProduct(task.id)} className="px-3 py-1.5 bg-[hsl(220,80%,50%)] text-white text-[12px] font-medium rounded-lg hover:bg-[hsl(220,80%,45%)]">Approve</button>
                        <button onClick={() => setActiveSection("products")} className="px-3 py-1.5 border border-[hsl(220,20%,88%)] text-[12px] font-medium rounded-lg text-[hsl(220,20%,30%)] hover:bg-[hsl(220,20%,96%)]">Review</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {pendingTasks.length > 6 && (
            <button className="mt-4 text-sm font-medium text-[hsl(220,80%,50%)] hover:underline text-center">
              View All Notifications
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[hsl(220,20%,15%)]">Recent Global Transactions</h2>
          <button className="text-sm font-medium text-[hsl(220,80%,50%)] hover:underline">View Transaction Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(220,20%,92%)]">
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Order</th>
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Buyer</th>
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Seller</th>
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Amount</th>
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Status</th>
                <th className="pb-3 text-left font-semibold text-[hsl(220,15%,55%)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.allOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[hsl(220,15%,60%)]">No transactions yet</td></tr>
              ) : (
                data.allOrders.slice(0, 8).map((order: any) => (
                  <tr key={order.id} className="border-b border-[hsl(220,20%,95%)] hover:bg-[hsl(220,20%,98%)]">
                    <td className="py-3 font-medium text-[hsl(220,20%,20%)]">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-[hsl(220,15%,45%)]">{order.buyer?.name || "—"}</td>
                    <td className="py-3 text-[hsl(220,15%,45%)]">{order.seller?.name || "—"}</td>
                    <td className="py-3 font-semibold text-[hsl(220,20%,15%)]">₹{order.amount?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        order.status === "delivered" ? "bg-[hsl(145,50%,92%)] text-[hsl(145,60%,35%)]" :
                        order.status === "cancelled" ? "bg-[hsl(0,50%,93%)] text-[hsl(0,65%,45%)]" :
                        order.status === "pending" ? "bg-[hsl(40,60%,92%)] text-[hsl(40,70%,35%)]" :
                        "bg-[hsl(220,40%,93%)] text-[hsl(220,60%,40%)]"
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-3 text-[hsl(220,15%,60%)]">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, trendUp, icon, barColor }: {
  label: string; value: string; trend: string; trendUp: boolean; icon: React.ReactNode; barColor: string;
}) => (
  <div className="bg-white rounded-2xl border border-[hsl(220,20%,92%)] p-5 relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px] text-[hsl(220,15%,55%)] font-medium">{label}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-[32px] font-bold text-[hsl(220,20%,15%)] leading-none">{value}</p>
          <span className={`text-[13px] font-semibold flex items-center gap-0.5 ${trendUp ? "text-[hsl(145,60%,40%)]" : "text-[hsl(0,65%,50%)]"}`}>
            {trend}
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
      <div className="w-11 h-11 rounded-xl bg-[hsl(220,20%,96%)] flex items-center justify-center">{icon}</div>
    </div>
    <div className="mt-4 h-1 rounded-full bg-[hsl(220,20%,94%)]">
      <div className="h-full rounded-full" style={{ width: "65%", backgroundColor: barColor }} />
    </div>
  </div>
);

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

export default AdminOverview;
