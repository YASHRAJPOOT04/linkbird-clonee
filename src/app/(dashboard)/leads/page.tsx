"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadDetailActions } from "@/lib/store/leadDetailStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadsTable from "@/components/leads/LeadsTable";
import LeadDetailSheet from "@/components/leads/LeadDetailSheet";
import { Plus, Users, TrendingUp, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Lead {
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
}

// Delete lead function
async function deleteLead(leadId: string): Promise<void> {
  const response = await fetch(`/api/leads?id=${leadId}`, {
    method: "DELETE",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete lead: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || "Failed to delete lead");
  }
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { openSheet } = useLeadDetailActions();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: (_, leadId) => {
      // Remove the lead from the leads list cache
      queryClient.setQueryData(["leads"], (oldData: unknown) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: (oldData as { pages: Array<{ data: { leads: Lead[] } }> }).pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              leads: page.data.leads.filter((lead: Lead) => lead.id !== leadId),
            },
          })),
        };
      });
      
      // Invalidate and refetch the leads list
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      toast.success("Lead deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });

  // Handle lead actions
  const handleLeadClick = (lead: Lead) => {
    openSheet(lead.id);
  };

  const handleEdit = (lead: Lead) => {
    // TODO: Implement edit lead modal/form
    console.log("Edit lead:", lead.id);
    toast.info("Edit lead functionality coming soon");
  };

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete "${lead.name}"?`)) {
      deleteMutation.mutate(lead.id);
    }
  };

  const handleStatusChange = (lead: Lead, newStatus: Lead["status"]) => {
    // This will be handled by the LeadDetailSheet component
    // The status change will trigger a refetch of the leads list
    console.log("Status change for lead:", lead.id, "to:", newStatus);
    toast.info(`Status change will be handled in the lead detail view`);
  };

  const handleCreateLead = () => {
    // TODO: Implement create lead modal/form
    toast.info("Create lead functionality coming soon");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    setTimeout(() => setIsRefreshing(false), 1000);
    toast.success("Leads refreshed");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            Manage your leads and track their progress through your sales funnel
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <AlertCircle className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateLead}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              New This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">—</div>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">—</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—%</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <LeadsTable
        onLeadClick={handleLeadClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {/* Lead Detail Sheet */}
      <LeadDetailSheet />
    </div>
  );
}
