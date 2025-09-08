import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Return sample data for development
    const sampleCampaigns = [
      {
        id: "camp_1",
        name: "Summer Marketing Campaign",
        status: "Active",
        createdAt: new Date().toISOString(),
        userId: "test_user",
        metrics: {
          totalLeads: 150,
          contactedLeads: 120,
          respondedLeads: 45,
          convertedLeads: 12,
        },
        responseRate: 30.0,
        conversionRate: 8.0,
      },
      {
        id: "camp_2", 
        name: "Product Launch Campaign",
        status: "Draft",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: "test_user",
        metrics: {
          totalLeads: 85,
          contactedLeads: 60,
          respondedLeads: 22,
          convertedLeads: 8,
        },
        responseRate: 25.9,
        conversionRate: 9.4,
      },
      {
        id: "camp_3",
        name: "Holiday Special Campaign", 
        status: "Completed",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        userId: "test_user",
        metrics: {
          totalLeads: 200,
          contactedLeads: 180,
          respondedLeads: 75,
          convertedLeads: 25,
        },
        responseRate: 37.5,
        conversionRate: 12.5,
      }
    ];

    return NextResponse.json({
      success: true,
      data: sampleCampaigns,
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
        name: name.trim(),
        status: status as "Draft" | "Active" | "Paused" | "Completed",
        userId: userId,
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

    // Update campaign
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
    // TODO: Replace with actual better-auth session validation
    const _userId = "demo-user-id";
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Delete campaign
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
