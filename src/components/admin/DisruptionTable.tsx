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
    <Card className="border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Parametric Disruption Events</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Automated triggers recorded across zones</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Time</TableHead>
            <TableHead className="text-xs">Zone</TableHead>
            <TableHead className="text-xs">Event Type</TableHead>
            <TableHead className="text-xs">Value</TableHead>
            <TableHead className="text-xs">Threshold</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="animate-fade-in">
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(event.recorded_at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </TableCell>
              <TableCell className="text-sm font-medium">{event.zone}</TableCell>
              <TableCell className="text-sm capitalize">{event.event_type.replace("_", " ")}</TableCell>
              <TableCell className="text-sm font-mono">{event.event_value}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {event.threshold_breached}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No disruption events recorded recently.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
