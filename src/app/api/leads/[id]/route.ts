import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, campaigns } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id: leadId } = await params;

    // Fetch lead with campaign information
    const leadData = await db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        status: leads.status,
        lastContactDate: leads.lastContactDate,
        createdAt: leads.createdAt,
        campaignId: leads.campaignId,
        campaign: {
          id: campaigns.id,
          name: campaigns.name,
          status: campaigns.status,
        },
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(
        and(
          eq(leads.id, leadId),
          eq(campaigns.userId, userId)
        )
      )
      .limit(1);

    if (leadData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Lead not found or access denied" },
        { status: 404 }
      );
    }

    const lead = leadData[0];

    // For demo purposes, add some additional mock data
    const leadWithDetails = {
      ...lead,
      phone: "+1 (555) 123-4567", // Mock phone number
      website: "https://example.com", // Mock website
      location: "San Francisco, CA", // Mock location
      notes: "This is a sample lead with additional details. They showed interest in our premium package during the initial call. Follow up scheduled for next week.",
      tags: ["High Priority", "Enterprise", "Demo Requested"],
    };

    return NextResponse.json({
      success: true,
      data: leadWithDetails,
    });
  } catch (error) {
    console.error("Error fetching lead details:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch lead details" 
      },
      { status: 500 }
    );
  }
}
