"use client";

import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Users,
  Mail,
  Building,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

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

interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: {
      hasNextPage: boolean;
      nextCursor: string | null;
      totalCount: number;
    };
    summary: {
      totalLeads: number;
      statusCounts: Record<string, number>;
    };
  };
}

interface LeadsTableProps {
  onLeadClick?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onStatusChange?: (lead: Lead, newStatus: Lead["status"]) => void;
}

const statusConfig = {
  Pending: {
    variant: "secondary" as const,
    color: "bg-yellow-100 text-yellow-800",
  },
  Contacted: {
    variant: "default" as const,
    color: "bg-blue-100 text-blue-800",
  },
  Responded: {
    variant: "default" as const,
    color: "bg-green-100 text-green-800",
  },
  Converted: {
    variant: "default" as const,
    color: "bg-purple-100 text-purple-800",
  },
};

const sortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "status", label: "Status" },
  { value: "lastContactDate", label: "Last Contact" },
];

// Fetch leads function
async function fetchLeads({
  pageParam,
  search,
  status,
  campaignId,
  sortBy,
  sortOrder,
}: {
  pageParam?: string;
  search?: string;
  status?: string;
  campaignId?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<LeadsResponse> {
  const params = new URLSearchParams({
    limit: "20",
    ...(pageParam && { cursor: pageParam }),
    ...(search && { search }),
    ...(status && { status }),
    ...(campaignId && { campaignId }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const response = await fetch(`/api/leads?${params}`, { credentials: "include" });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch leads: ${response.statusText}`);
  }
  
  return response.json();
}

export default function LeadsTable({
  onLeadClick,
  onEdit,
  onDelete,
  onStatusChange: _, // Future: direct status change from table
}: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [campaignFilter, setCampaignFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Infinite query for leads
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["leads", { search, statusFilter, campaignFilter, sortBy, sortOrder }],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchLeads({
        pageParam,
        search: search || undefined,
        status: statusFilter || undefined,
        campaignId: campaignFilter || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.pagination.hasNextPage) {
        return lastPage.data.pagination.nextCursor;
      }
      return undefined;
    },
    initialPageParam: undefined,
  });

  // Flatten all leads from all pages
  const allLeads = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.leads) ?? [];
  }, [data]);

  // Summary data from the first page
  const summary = data?.pages[0]?.data.summary;

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
  };

  const handleSortChange = (field: string) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Handle lead actions
  const handleLeadClick = (lead: Lead) => {
    onLeadClick?.(lead);
  };

  const handleAction = (action: string, lead: Lead) => {
    switch (action) {
      case "edit":
        onEdit?.(lead);
        break;
      case "delete":
        onDelete?.(lead);
        break;
    }
  };

  // Trigger fetch next page when in view
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  // Loading skeleton for initial load
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            
            {/* Table skeleton */}
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
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
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (allLeads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Leads</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || statusFilter ? "No leads found" : "No leads yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter
                ? "Try adjusting your search or filters"
                : "Get started by importing leads or creating them manually"
              }
            </p>
            {search || statusFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCampaignFilter("");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => onEdit?.({} as Lead)}>
                Add Lead
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Leads</span>
            {summary && (
              <Badge variant="outline" className="ml-2">
                {summary.totalLeads} total
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Responded">Responded</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sort by</label>
                <div className="flex space-x-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Status counts */}
            {summary && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.statusCounts).map(([status, count]) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortBy === "name" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange("status")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortBy === "status" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange("email")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortBy === "email" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange("company")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    {sortBy === "company" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSortChange("lastContactDate")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Last Contact</span>
                    {sortBy === "lastContactDate" && (
                      sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLeads.map((lead) => {
                const statusInfo = statusConfig[lead.status];

                return (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleLeadClick(lead)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added {format(new Date(lead.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge
                        variant={statusInfo.variant}
                        className={`${statusInfo.color} w-fit`}
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{lead.email}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {lead.company ? (
                        <div className="flex items-center space-x-2">
                          <Building className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {lead.campaign.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {lead.campaign.status}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {lead.lastContactDate ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {format(new Date(lead.lastContactDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Never</span>
                      )}
                    </TableCell>
                    
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("edit", lead)}>
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("delete", lead)}
                            className="text-red-600"
                          >
                            Delete Lead
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

        {/* Load more trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading more leads...</span>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                Load More
              </Button>
            )}
          </div>
        )}

        {/* End of results */}
        {!hasNextPage && allLeads.length > 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            You&apos;ve reached the end of the results
          </div>
        )}
      </CardContent>
    </Card>
  );
}
