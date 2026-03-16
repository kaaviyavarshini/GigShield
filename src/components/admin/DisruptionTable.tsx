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
    <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
      <div className="p-6 border-b border-[#BAE6FD] bg-[#F0F9FF]">
        <h2 className="text-sm font-bold text-[#0C1A2E]">Parametric Disruption Events</h2>
        <p className="text-caption mt-0.5 text-[#64748B]">Automated triggers recorded across zones</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-[#BAE6FD] bg-[#F0F9FF]">
            <TableHead className="text-label text-[#0EA5E9] py-4">Time</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">Zone</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">Event Type</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4">Value</TableHead>
            <TableHead className="text-label text-[#0EA5E9] py-4 text-right">Threshold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="transition-all border-b border-[#F0F9FF] hover:bg-[#F0F9FF] group">
              <TableCell className="text-[12px] text-[#64748B] whitespace-nowrap py-4">
                {new Date(event.recorded_at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
                })}
              </TableCell>
              <TableCell className="text-[14px] font-bold text-[#0C1A2E] group-hover:text-[#0EA5E9] transition-colors">{event.zone}</TableCell>
              <TableCell className="text-[13px] font-medium capitalize text-[#0C1A2E] opacity-80">{event.event_type.replace("_", " ")}</TableCell>
              <TableCell className="text-[14px] font-mono-data font-bold text-[#0EA5E9]">{event.event_value}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="font-bold border-[#BAE6FD] bg-[#F0F9FF] text-[#64748B]">
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
