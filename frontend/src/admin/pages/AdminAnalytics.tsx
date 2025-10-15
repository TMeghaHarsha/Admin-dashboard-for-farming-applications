import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>No analytics yet</CardTitle>
          <CardDescription>Analytics will appear once there is activity.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
