import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send } from "lucide-react";

const mockReleases = [
  { version: "v2.5.0", date: "2024-06-15", notes: "Added new analytics dashboard", status: "released" },
  { version: "v2.4.1", date: "2024-06-10", notes: "Bug fixes and performance improvements", status: "released" },
  { version: "v2.4.0", date: "2024-06-05", notes: "New crop monitoring features", status: "released" },
  { version: "v2.3.0", date: "2024-05-28", notes: "Enhanced notification system", status: "released" },
  { version: "v2.6.0", date: "2024-06-20", notes: "Upcoming feature: AI recommendations", status: "pending" },
];

export default function Updates() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Updates</h1>
            <p className="text-muted-foreground">Manage releases and version updates</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Update</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Version Number</Label>
                  <Input placeholder="e.g., v2.6.0" />
                </div>
                <div className="space-y-2">
                  <Label>Release Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Changelog</Label>
                  <Textarea 
                    placeholder="Describe the changes in this version..." 
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Create Release</Button>
                  <Button variant="outline" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Release History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead>Release Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReleases.map((release) => (
                  <TableRow key={release.version}>
                    <TableCell className="font-medium">{release.version}</TableCell>
                    <TableCell>{release.date}</TableCell>
                    <TableCell>{release.notes}</TableCell>
                    <TableCell>
                      <Badge
                        variant={release.status === "released" ? "default" : "secondary"}
                      >
                        {release.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Send className="h-4 w-4" />
                        Notify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
