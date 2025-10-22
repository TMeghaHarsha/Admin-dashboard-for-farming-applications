import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sprout, Activity, Download, Search } from "lucide-react";

const mockCrops = [
  { id: 1, field: "Field A-101", crop: "Wheat", region: "North", state: "Punjab", acres: 25, health: 92, status: "Healthy" },
  { id: 2, field: "Field B-205", crop: "Rice", region: "East", state: "West Bengal", acres: 30, health: 88, status: "Healthy" },
  { id: 3, field: "Field C-310", crop: "Cotton", region: "West", state: "Gujarat", acres: 20, health: 75, status: "Moderate" },
  { id: 4, field: "Field D-412", crop: "Sugarcane", region: "South", state: "Tamil Nadu", acres: 35, health: 65, status: "Attention" },
  { id: 5, field: "Field E-520", crop: "Maize", region: "Central", state: "Madhya Pradesh", acres: 28, health: 90, status: "Healthy" },
];

export default function Crops() {
  const getHealthBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "Healthy": "default",
      "Moderate": "secondary",
      "Attention": "destructive",
    };
    return variants[status] || "default";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crops Management</h1>
          <p className="text-muted-foreground">Monitor and manage all agricultural fields</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Fields" value="1,234" icon={MapPin} />
          <MetricCard label="Total Acres" value="34,567" icon={Sprout} />
          <MetricCard label="Active Crops" value="15" icon={Activity} />
          <MetricCard label="Avg Health Score" value="85%" change={3.2} trend="up" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search fields..." className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north">North</SelectItem>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Crop Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field ID</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Acres</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCrops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell className="font-medium">{crop.field}</TableCell>
                      <TableCell>{crop.crop}</TableCell>
                      <TableCell>{crop.region}</TableCell>
                      <TableCell>{crop.state}</TableCell>
                      <TableCell>{crop.acres}</TableCell>
                      <TableCell>{crop.health}%</TableCell>
                      <TableCell>
                        <Badge variant={getHealthBadge(crop.status)}>
                          {crop.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
