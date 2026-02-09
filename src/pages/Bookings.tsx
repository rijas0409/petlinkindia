import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

const SAMPLE_BOOKINGS = [
  { id: "1", type: "Vet Consultation", status: "Completed", date: "Feb 5, 2026", time: "10:30 AM", amount: 500 },
  { id: "2", type: "Pet Grooming", status: "Upcoming", date: "Feb 12, 2026", time: "2:00 PM", amount: 350 },
  { id: "3", type: "Vet Consultation", status: "Cancelled", date: "Jan 20, 2026", time: "11:00 AM", amount: 500 },
];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Upcoming: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-600",
};

const Bookings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">My Bookings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">
        {SAMPLE_BOOKINGS.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground">Your booking history will appear here</p>
          </div>
        ) : (
          SAMPLE_BOOKINGS.map((booking) => (
            <Card key={booking.id} className="p-4 rounded-2xl border-0 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{booking.type}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusColors[booking.status] || "bg-muted"}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="font-bold text-primary">₹{booking.amount}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default Bookings;
