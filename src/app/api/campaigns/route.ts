import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Temporarily bypass auth and use a demo user ID if no session
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const userId = session?.user?.id || "demo-user";

    // Fetch campaigns for the logged-in user
    const userCampaigns = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        userId: campaigns.userId,
      })
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));

    // If no campaigns exist for this user, provide demo campaigns
    const baseCampaigns = userCampaigns.length > 0
      ? userCampaigns
      : [
          {
            id: "demo-campaign-1",
            name: "Product Launch Q4",
            status: "Active" as const,
            createdAt: new Date(),
            userId,
          },
          {
            id: "demo-campaign-2",
            name: "Black Friday Promo",
            status: "Draft" as const,
            createdAt: new Date(),
            userId,
          },
          {
            id: "demo-campaign-3",
            name: "Win-Back Series",
            status: "Paused" as const,
            createdAt: new Date(),
            userId,
          },
        ];

    // Calculate additional metrics for each campaign
    const campaignsWithMetrics = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      baseCampaigns.map(async (campaign: any) => {
        // TODO: Add actual lead counts and metrics calculation
        // For now, we'll return mock data
        const mockMetrics = {
          totalLeads: Math.floor(Math.random() * 100) + 10,
          contactedLeads: Math.floor(Math.random() * 50) + 5,
          respondedLeads: Math.floor(Math.random() * 20) + 2,
          convertedLeads: Math.floor(Math.random() * 10) + 1,
        };

        const responseRate = mockMetrics.totalLeads > 0 
          ? (mockMetrics.respondedLeads / mockMetrics.totalLeads) * 100 
          : 0;

        const conversionRate = mockMetrics.totalLeads > 0 
          ? (mockMetrics.convertedLeads / mockMetrics.totalLeads) * 100 
          : 0;

        return {
          ...campaign,
          metrics: mockMetrics,
          responseRate: Math.round(responseRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          // UI extras (not yet persisted):
          description:
            campaign.description ||
            "Multi-touch campaign to drive conversions and re-engage leads.",
          budget: campaign.budget ?? 5000,
          tags:
            campaign.tags || [
              "email",
              "retargeting",
              campaign.status.toLowerCase(),
            ],
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: campaignsWithMetrics,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch campaigns" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily bypass auth and use a demo user ID if no session
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const userId = session?.user?.id || "demo-user";
    
    const body = await request.json();
    const { name, status = "Draft" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Campaign name is required" },
        { status: 400 }
      );
    }

    // Create new campaign
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        id: crypto.randomUUID(),
        name: name.trim(),
        status: status as "Draft" | "Active" | "Paused" | "Completed",
        userId: userId,
        createdAt: new Date(),
      })
      .returning({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        userId: campaigns.userId,
      });

    return NextResponse.json({
      success: true,
      data: newCampaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create campaign" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Temporarily bypass auth and use a demo user ID if no session
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const userId = session?.user?.id || "demo-user";
    
    const body = await request.json();
    const { id, name, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Update campaign (only allow updates to user's own campaigns)
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        ...(name && { name: name.trim() }),
        ...(status && { status }),
      })
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .returning({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        userId: campaigns.userId,
      });

    if (!updatedCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update campaign" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Temporarily bypass auth and use a demo user ID if no session
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const userId = session?.user?.id || "demo-user";
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Delete campaign (only allow deletion of user's own campaigns)
    const [deletedCampaign] = await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .returning({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        userId: campaigns.userId,
      });

    if (!deletedCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedCampaign,
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete campaign" 
      },
      { status: 500 }
    );
  }
}
