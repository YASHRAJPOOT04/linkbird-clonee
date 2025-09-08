"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "Pending" | "Contacted" | "Responded" | "Converted";
  lastContactDate?: string;
  createdAt: string;
  campaignId: string;
  campaignName?: string;
}

// Mock sample data for development
const sampleLeads: Lead[] = [
  {
    id: "lead_1",
    name: "Alice Johnson",
    email: "alice@techcorp.com",
    company: "TechCorp Inc.",
    status: "Responded",
    lastContactDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    campaignId: "camp_1",
    campaignName: "Summer Marketing Campaign",
  },
  {
    id: "lead_2",
    name: "Bob Smith",
    email: "bob@startup.io",
    company: "Startup.io",
    status: "Contacted",
    lastContactDate: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    campaignId: "camp_1",
    campaignName: "Summer Marketing Campaign",
  },
  {
    id: "lead_3",
    name: "Carol Davis",
    email: "carol@enterprise.com",
    company: "Enterprise Solutions",
    status: "Pending",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    campaignId: "camp_2",
    campaignName: "Product Launch Campaign",
  },
  {
    id: "lead_4",
    name: "David Wilson",
    email: "david@consulting.biz",
    company: "Wilson Consulting",
    status: "Converted",
    lastContactDate: new Date(Date.now() - 604800000).toISOString(),
    createdAt: new Date(Date.now() - 691200000).toISOString(),
    campaignId: "camp_3",
    campaignName: "Holiday Special Campaign",
  },
];

// Fetch leads function
async function fetchLeads(): Promise<Lead[]> {
  // Return sample data for development
  return new Promise((resolve) => {
    setTimeout(() => resolve(sampleLeads), 500);
  });
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Contacted: "bg-blue-100 text-blue-800",
  Responded: "bg-green-100 text-green-800",
  Converted: "bg-purple-100 text-purple-800",
};

export default function LeadsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch leads query
  const {
    data: leads = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Leads refreshed");
    } catch (error) {
      toast.error("Failed to refresh leads");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateLead = () => {
    toast.info("Create lead functionality coming soon");
  };

  // Calculate summary stats
  const totalLeads = leads.length;
  const pendingLeads = leads.filter((l) => l.status === "Pending").length;
  const convertedLeads = leads.filter((l) => l.status === "Converted").length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load leads
              </h3>
              <p className="text-gray-500 mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
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
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            Manage your leads and track their progress through the sales funnel
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
          <Button onClick={handleCreateLead}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingLeads}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Converted Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{convertedLeads}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 py-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.company || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            statusColors[lead.status]
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.campaignName || "Unknown Campaign"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.lastContactDate
                          ? new Date(lead.lastContactDate).toLocaleDateString()
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}