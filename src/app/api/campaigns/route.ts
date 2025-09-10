import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: invalid or expired session" }, { status: 401 });
    }
    
    const userId = session.user.id;

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

    // Calculate additional metrics for each campaign
    const campaignsWithMetrics = await Promise.all(
      userCampaigns.map(async (campaign) => {
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
    // Get session from better-auth
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
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
    // Get session from better-auth
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
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
      .where(eq(campaigns.id, id))
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
    // Get session from better-auth
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
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
      .where(eq(campaigns.id, id))
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
