import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type DisruptionEvent = {
  id: string;
  zone: string;
  event_type: string;
  event_value: number;
  threshold_breached: number;
  recorded_at: string;
};

export function DisruptionTable({ events }: { events: DisruptionEvent[] }) {
  return (
    <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden bg-white rounded-xl">
      <div className="p-6 border-b border-[#E2E8F0] bg-white">
        <h2 className="text-[14px] font-semibold text-[#0F172A]">Parametric Disruption Events</h2>
        <p className="text-[12px] mt-0.5 text-[#94A3B8]">Automated triggers recorded across zones</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <TableHead className="py-4">Time</TableHead>
            <TableHead className="py-4">Zone</TableHead>
            <TableHead className="py-4">Event Type</TableHead>
            <TableHead className="py-4">Value</TableHead>
            <TableHead className="py-4 text-right">Threshold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="transition-all border-b border-[#E2E8F0] hover:bg-[#F8FAFC] group">
               <TableCell className="text-[12px] text-[#94A3B8] whitespace-nowrap py-4">
                {new Date(event.recorded_at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
                })}
              </TableCell>
              <TableCell className="text-[14px] font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">{event.zone}</TableCell>
              <TableCell className="text-[13px] font-medium capitalize text-[#334155]">{event.event_type.replace("_", " ")}</TableCell>
              <TableCell className="text-[14px] font-mono-data font-bold text-[#0EA5E9]">{event.event_value}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="font-semibold border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] rounded-full">
                    {event.threshold_breached}
                  </Badge>
                </TableCell>
              </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <p className="text-caption italic text-center text-[#64748B]">No disruption events recorded recently.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
