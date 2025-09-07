"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadDetailState, useLeadDetailActions } from "@/lib/store/leadDetailStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface LeadDetail {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: "Pending" | "Contacted" | "Responded" | "Converted";
  lastContactDate: string | null;
  createdAt: string;
  campaignId: string;
  campaign: {
    id: string;
    name: string;
    status: string;
  };
  // Additional fields that might be fetched for detail view
  phone?: string;
  website?: string;
  location?: string;
  notes?: string;
  tags?: string[];
}

interface LeadDetailResponse {
  success: boolean;
  data: LeadDetail;
  error?: string;
}

// Fetch lead details function
async function fetchLeadDetails(leadId: string): Promise<LeadDetail> {
  const response = await fetch(`/api/leads/${leadId}`, { credentials: "include" });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lead details: ${response.statusText}`);
  }
  
  const result: LeadDetailResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch lead details");
  }
  
  return result.data;
}

// Update lead status function
async function updateLeadStatus(leadId: string, status: LeadDetail["status"]): Promise<LeadDetail> {
  const response = await fetch("/api/leads", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      id: leadId,
      status,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update lead status: ${response.statusText}`);
  }
  
  const result: LeadDetailResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to update lead status");
  }
  
  return result.data;
}

const statusConfig = {
  Pending: {
    variant: "secondary" as const,
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  Contacted: {
    variant: "default" as const,
    color: "bg-blue-100 text-blue-800",
    icon: MessageSquare,
  },
  Responded: {
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  Converted: {
    variant: "default" as const,
    color: "bg-purple-100 text-purple-800",
    icon: TrendingUp,
  },
};

export default function LeadDetailSheet() {
  const { isOpen, leadId } = useLeadDetailState();
  const { closeSheet } = useLeadDetailActions();
  const queryClient = useQueryClient();

  // Fetch lead details
  const {
    data: lead,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["lead-detail", leadId],
    queryFn: () => fetchLeadDetails(leadId!),
    enabled: !!leadId && isOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadDetail["status"] }) =>
      updateLeadStatus(leadId, status),
    onSuccess: (updatedLead) => {
      // Update the lead in the leads list cache
      queryClient.setQueryData(["lead-detail", leadId], updatedLead);
      
      // Invalidate and refetch the leads list
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      toast.success(`Lead status updated to ${updatedLead.status.toLowerCase()}`);
    },
    onError: (error) => {
      toast.error(`Failed to update lead status: ${error.message}`);
    },
  });

  const handleStatusChange = (newStatus: LeadDetail["status"]) => {
    if (leadId && lead) {
      updateStatusMutation.mutate({
        leadId,
        status: newStatus,
      });
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit lead functionality
    toast.info("Edit lead functionality coming soon");
  };

  const handleDelete = () => {
    if (lead) {
      if (window.confirm(`Are you sure you want to delete "${lead.name}"?`)) {
        // TODO: Implement delete lead functionality
        toast.info("Delete lead functionality coming soon");
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Lead details refreshed");
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeSheet}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Lead Details</SheetTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Lead
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <SheetDescription>
            View and manage lead information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load lead details
              </h3>
              <p className="text-gray-500 mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Lead Details */}
          {lead && (
            <div className="space-y-6">
              {/* Lead Header */}
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {lead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
                  <p className="text-sm text-gray-500">{lead.email}</p>
                </div>
                <Badge
                  variant={statusConfig[lead.status].variant}
                  className={`${statusConfig[lead.status].color} flex items-center space-x-1`}
                >
                  {React.createElement(statusConfig[lead.status].icon, { className: "h-3 w-3" })}
                  <span>{lead.status}</span>
                </Badge>
              </div>

              {/* Status Update */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={lead.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Responded">Responded</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{lead.email}</span>
                  </div>
                  
                  {lead.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{lead.phone}</span>
                    </div>
                  )}
                  
                  {lead.company && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{lead.company}</span>
                    </div>
                  )}
                  
                  {lead.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {lead.website}
                      </a>
                    </div>
                  )}
                  
                  {lead.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{lead.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campaign Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {lead.campaign.name}
                      </span>
                      <Badge variant="outline">{lead.campaign.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Created</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(lead.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                  
                  {lead.lastContactDate && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Last Contact</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(lead.lastContactDate), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {lead.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {lead.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
