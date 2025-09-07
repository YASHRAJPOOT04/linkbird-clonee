"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  status: "Draft" | "Active" | "Paused" | "Completed";
  createdAt: string;
  userId: string;
  metrics: {
    totalLeads: number;
    contactedLeads: number;
    respondedLeads: number;
    convertedLeads: number;
  };
  responseRate: number;
  conversionRate: number;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
  onView?: (campaign: Campaign) => void;
  onStatusChange?: (campaign: Campaign, newStatus: Campaign["status"]) => void;
}

const statusConfig = {
  Draft: {
    variant: "secondary" as const,
    icon: Edit,
    color: "bg-gray-100 text-gray-800",
  },
  Active: {
    variant: "default" as const,
    icon: Play,
    color: "bg-green-100 text-green-800",
  },
  Paused: {
    variant: "secondary" as const,
    icon: Pause,
    color: "bg-yellow-100 text-yellow-800",
  },
  Completed: {
    variant: "outline" as const,
    icon: Square,
    color: "bg-blue-100 text-blue-800",
  },
};

export default function CampaignsTable({
  campaigns,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}: CampaignsTableProps) {
  const [_selectedCampaign, _setSelectedCampaign] = useState<Campaign | null>(null);

  const handleStatusChange = (campaign: Campaign, newStatus: Campaign["status"]) => {
    onStatusChange?.(campaign, newStatus);
  };

  const handleAction = (action: string, campaign: Campaign) => {
    switch (action) {
      case "edit":
        onEdit?.(campaign);
        break;
      case "delete":
        onDelete?.(campaign);
        break;
      case "view":
        onView?.(campaign);
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first campaign.
            </p>
            <Button onClick={() => onEdit?.({} as Campaign)}>
              Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Campaigns</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Rate</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const statusInfo = statusConfig[campaign.status];
                const StatusIcon = statusInfo.icon;
                const progressValue = (campaign.metrics.contactedLeads / campaign.metrics.totalLeads) * 100;

                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </span>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{campaign.metrics.totalLeads} leads</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{campaign.conversionRate}% converted</span>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant}
                        className={`${statusInfo.color} flex items-center space-x-1 w-fit`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span>{campaign.status}</span>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.responseRate}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaign.metrics.respondedLeads} of {campaign.metrics.totalLeads}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={progressValue} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {Math.round(progressValue)}% contacted
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("view", campaign)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("edit", campaign)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {campaign.status === "Draft" && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campaign, "Active")}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Campaign
                            </DropdownMenuItem>
                          )}
                          {campaign.status === "Active" && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campaign, "Paused")}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Campaign
                            </DropdownMenuItem>
                          )}
                          {campaign.status === "Paused" && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campaign, "Active")}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume Campaign
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleAction("delete", campaign)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
