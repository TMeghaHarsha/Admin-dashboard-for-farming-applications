import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface FieldRow { id: number; name: string; crop?: number; crop_variety?: number; location_name?: string; area?: any; soil_type_name?: string }

export default function AdminCrops() {
  const [fields, setFields] = useState<FieldRow[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/admin/fields/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFields(Array.isArray(d?.results) ? d.results : d || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Soil</TableHead>
                  <TableHead>Hectares</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>{f.location_name || "-"}</TableCell>
                    <TableCell><Badge variant="secondary">{f.soil_type_name || "-"}</Badge></TableCell>
                    <TableCell>{(f.area || {}).hectares ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
