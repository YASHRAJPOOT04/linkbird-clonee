"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Users, Play, Pause, Square, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  status: "Draft" | "Active" | "Paused" | "Completed";
  createdAt: string;
  userId: string;
  description?: string;
  budget?: number;
  tags?: string[];
  metrics: {
    totalLeads: number;
    contactedLeads: number;
    respondedLeads: number;
    convertedLeads: number;
  };
  responseRate: number;
  conversionRate: number;
}

interface CampaignDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  onStatusChange?: (campaign: Campaign, newStatus: Campaign["status"]) => void;
}

const statusIconMap = {
  Draft: Edit,
  Active: Play,
  Paused: Pause,
  Completed: Square,
};

export default function CampaignDetailSheet({
  open,
  onOpenChange,
  campaign,
  onEdit,
  onDelete,
  onStatusChange,
}: CampaignDetailSheetProps) {
  if (!campaign) {
    return null;
  }

  const StatusIcon = statusIconMap[campaign.status];
  const progressValue = (campaign.metrics.contactedLeads / campaign.metrics.totalLeads) * 100;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{campaign.name}</span>
            <Badge className="ml-2 flex items-center space-x-1">
              <StatusIcon className="h-3 w-3" />
              <span>{campaign.status}</span>
            </Badge>
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Created {format(new Date(campaign.createdAt), "MMM d, yyyy")}</span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {campaign.description && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{campaign.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Total Leads</span>
                  </div>
                  <div className="text-2xl font-semibold">{campaign.metrics.totalLeads}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500 mb-1 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Response Rate</span>
                  </div>
                  <div className="text-2xl font-semibold">{campaign.responseRate}%</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
                <div className="text-xs text-gray-500">
                  {campaign.metrics.contactedLeads} contacted / {campaign.metrics.totalLeads} total
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Budget</div>
                  <div className="text-sm font-medium">
                    {typeof campaign.budget === "number" ? campaign.budget.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {(campaign.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    {(!campaign.tags || campaign.tags.length === 0) && <span className="text-sm text-gray-500">—</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="space-x-2">
              {campaign.status === "Draft" && (
                <Button onClick={() => onStatusChange?.(campaign, "Active")}>Start</Button>
              )}
              {campaign.status === "Active" && (
                <Button variant="secondary" onClick={() => onStatusChange?.(campaign, "Paused")}>
                  Pause
                </Button>
              )}
              {campaign.status === "Paused" && (
                <Button onClick={() => onStatusChange?.(campaign, "Active")}>Resume</Button>
              )}
              {campaign.status !== "Completed" && (
                <Button variant="outline" onClick={() => onStatusChange?.(campaign, "Completed")}>
                  Complete
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onEdit?.(campaign)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => onDelete?.(campaign)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

