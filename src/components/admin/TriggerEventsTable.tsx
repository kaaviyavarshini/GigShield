import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Thermometer, Wind, Database } from "lucide-react";

export type TriggerEvent = {
  id: string;
  policy_id: string;
  city: string;
  rainfall_mm: number;
  temperature: number;
  windspeed: number;
  triggered_at: string;
  payout_amount: number;
  status: "pending" | "paid" | "failed";
};

export function TriggerEventsTable({ events }: { events: TriggerEvent[] }) {
  return (
    <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
      <div className="p-6 border-b border-[#BAE6FD] bg-[#F0F9FF]">
        <h2 className="text-sm font-bold text-[#0C1A2E]">Verified Trigger Events</h2>
        <p className="text-caption mt-0.5 text-[#64748B]">Parametric triggers satisfying policy conditions</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#BAE6FD] bg-[#F0F9FF]">
            <TableHead className="text-label text-[#0EA5E9] py-4">Time</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">City</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">Conditions</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">Payout</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="transition-all border-b border-[#F0F9FF] hover:bg-[#F0F9FF] group">
              <TableCell className="text-[12px] text-[#64748B] whitespace-nowrap py-4">
                {new Date(event.triggered_at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
                })}
              </TableCell>
              <TableCell className="text-[14px] font-bold text-[#0C1A2E] group-hover:text-[#0EA5E9] transition-colors">{event.city}</TableCell>
              <TableCell>
                <div className="flex items-center gap-4 text-[13px] font-bold">
                  <span className="flex items-center gap-1.5 text-[#0EA5E9]">
                    <CloudRain className="h-3.5 w-3.5" /> {event.rainfall_mm}mm
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Thermometer className="h-3.5 w-3.5" /> {event.temperature}°C
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-[14px] font-mono-data font-bold text-[#0EA5E9]">₹{event.payout_amount.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant={event.status === 'paid' ? 'paid' : event.status === 'pending' ? 'pending' : 'rejected'} 
                  className="px-3"
                >
                  {event.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-16">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Database className="h-8 w-8 text-[#BAE6FD]" />
                  <p className="text-caption italic text-[#64748B]">No verified trigger events yet.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
