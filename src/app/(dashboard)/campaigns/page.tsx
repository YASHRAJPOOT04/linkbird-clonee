"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

interface ApiResponse {
  success: boolean;
  data: Campaign[];
  error?: string;
}

// Fetch campaigns function
async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch("/api/campaigns", { credentials: "include" });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
  }
  
  const result: ApiResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch campaigns");
  }
  
  return result.data;
}

// Update campaign status function
async function updateCampaignStatus(campaignId: string, status: Campaign["status"]): Promise<Campaign> {
  const response = await fetch("/api/campaigns", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      id: campaignId,
      status,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update campaign: ${response.statusText}`);
  }
  
  const result: ApiResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to update campaign");
  }
  
  return result.data[0];
}

// Delete campaign function
async function deleteCampaign(campaignId: string): Promise<void> {
  const response = await fetch(`/api/campaigns?id=${campaignId}`, {
    method: "DELETE",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete campaign: ${response.statusText}`);
  }
  
  const result: ApiResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to delete campaign");
  }
}

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch campaigns query
  const {
    data: campaigns = [],
    isLoading,
    error: _error,
    refetch,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });

  // Update campaign status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ campaignId, status }: { campaignId: string; status: Campaign["status"] }) =>
      updateCampaignStatus(campaignId, status),
    onSuccess: (updatedCampaign) => {
      queryClient.setQueryData(["campaigns"], (oldData: Campaign[] | undefined) => {
        if (!oldData) return [updatedCampaign];
        return oldData.map((campaign) =>
          campaign.id === updatedCampaign.id ? updatedCampaign : campaign
        );
      });
      toast.success(`Campaign ${updatedCampaign.status.toLowerCase()} successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: (_, campaignId) => {
      queryClient.setQueryData(["campaigns"], (oldData: Campaign[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((campaign) => campaign.id !== campaignId);
      });
      toast.success("Campaign deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Campaigns refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh campaigns");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle campaign actions
  const handleEdit = (campaign: Campaign) => {
    // TODO: Implement edit campaign modal/form
    console.log("Edit campaign:", campaign.id);
    toast.info("Edit campaign functionality coming soon");
  };

  const handleDelete = (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      deleteMutation.mutate(campaign.id);
    }
  };

  const handleView = (campaign: Campaign) => {
    // TODO: Implement view campaign details
    console.log("View campaign:", campaign.id);
    toast.info("View campaign details coming soon");
  };

  const handleStatusChange = (campaign: Campaign, newStatus: Campaign["status"]) => {
    updateStatusMutation.mutate({
      campaignId: campaign.id,
      status: newStatus,
    });
  };

  const handleCreateCampaign = () => {
    // TODO: Implement create campaign modal/form
    toast.info("Create campaign functionality coming soon");
  };

  // Calculate summary stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;
  const totalLeads = campaigns.reduce((sum, c) => sum + c.metrics.totalLeads, 0);
  const avgResponseRate = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length 
    : 0;

  if (_error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load campaigns
              </h3>
              <p className="text-gray-500 mb-4">
                {_error instanceof Error ? _error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">
            Manage your marketing campaigns and track their performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCampaigns}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Response Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgResponseRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns Table */}
      <CampaignsTable
        campaigns={campaigns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
