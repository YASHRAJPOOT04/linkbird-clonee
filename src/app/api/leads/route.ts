import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, campaigns } from "../../../db/schema";
import { eq, desc, and, lt, gt, or, like, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("better-auth.session_token")) {
      return NextResponse.json({ error: "Unauthorized: missing session cookie" }, { status: 401 });
    }
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.set("cookie", cookieHeader);
    const session = await auth.api.getSession({ headers: forwardedHeaders });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: invalid or expired session" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE)),
      MAX_PAGE_SIZE
    );
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where conditions
    const whereConditions = [];
    
    // Filter by user's campaigns
    whereConditions.push(
      sql`${leads.campaignId} IN (
        SELECT ${campaigns.id} 
        FROM ${campaigns} 
        WHERE ${campaigns.userId} = ${userId}
      )`
    );

    // Add search filter
    if (search) {
      whereConditions.push(
        or(
          like(leads.name, `%${search}%`),
          like(leads.email, `%${search}%`),
          like(leads.company, `%${search}%`)
        )!
      );
    }

    // Add status filter
    if (status) {
      whereConditions.push(eq(leads.status, status as "Pending" | "Contacted" | "Responded" | "Converted"));
    }

    // Add campaign filter
    if (campaignId) {
      whereConditions.push(eq(leads.campaignId, campaignId));
    }

    // Add cursor-based pagination
    if (cursor) {
      const cursorValue = JSON.parse(cursor);
      if (sortOrder === "desc") {
        whereConditions.push(lt(leads.createdAt, new Date(cursorValue.createdAt)));
      } else {
        whereConditions.push(gt(leads.createdAt, new Date(cursorValue.createdAt)));
      }
    }

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case "name":
        orderBy = sortOrder === "desc" ? desc(leads.name) : leads.name;
        break;
      case "email":
        orderBy = sortOrder === "desc" ? desc(leads.email) : leads.email;
        break;
      case "company":
        orderBy = sortOrder === "desc" ? desc(leads.company) : leads.company;
        break;
      case "status":
        orderBy = sortOrder === "desc" ? desc(leads.status) : leads.status;
        break;
      case "lastContactDate":
        orderBy = sortOrder === "desc" ? desc(leads.lastContactDate) : leads.lastContactDate;
        break;
      default:
        orderBy = sortOrder === "desc" ? desc(leads.createdAt) : leads.createdAt;
    }

    // Fetch leads with campaign information
    const leadsData = await db
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
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit + 1); // Fetch one extra to determine if there are more pages

    // Check if there are more pages
    const hasNextPage = leadsData.length > limit;
    const actualLeads = hasNextPage ? leadsData.slice(0, -1) : leadsData;

    // Generate next cursor
    let nextCursor = null;
    if (hasNextPage && actualLeads.length > 0) {
      const lastLead = actualLeads[actualLeads.length - 1];
      nextCursor = JSON.stringify({
        createdAt: lastLead.createdAt.toISOString(),
        id: lastLead.id, // Include ID for uniqueness
      });
    }

    // Calculate summary statistics
    const totalLeads = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(
        and(
          sql`${leads.campaignId} IN (
            SELECT ${campaigns.id} 
            FROM ${campaigns} 
            WHERE ${campaigns.userId} = ${userId}
          )`,
          ...(search ? [
            or(
              like(leads.name, `%${search}%`),
              like(leads.email, `%${search}%`),
              like(leads.company, `%${search}%`)
            )!
          ] : []),
          ...(status ? [eq(leads.status, status as "Pending" | "Contacted" | "Responded" | "Converted")] : []),
          ...(campaignId ? [eq(leads.campaignId, campaignId)] : [])
        )
      );

    const statusCounts = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(
        and(
          sql`${leads.campaignId} IN (
            SELECT ${campaigns.id} 
            FROM ${campaigns} 
            WHERE ${campaigns.userId} = ${userId}
          )`,
          ...(search ? [
            or(
              like(leads.name, `%${search}%`),
              like(leads.email, `%${search}%`),
              like(leads.company, `%${search}%`)
            )!
          ] : []),
          ...(campaignId ? [eq(leads.campaignId, campaignId)] : [])
        )
      )
      .groupBy(leads.status);

    return NextResponse.json({
      success: true,
      data: {
        leads: actualLeads,
        pagination: {
          hasNextPage,
          nextCursor,
          totalCount: totalLeads[0]?.count || 0,
        },
        summary: {
          totalLeads: totalLeads[0]?.count || 0,
          statusCounts: statusCounts.reduce<Record<string, number>>((acc: Record<string, number>, item: { status: string; count: number }) => {
            acc[item.status] = item.count;
            return acc;
          }, {}),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch leads" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("better-auth.session_token")) {
      return NextResponse.json({ error: "Unauthorized: missing session cookie" }, { status: 401 });
    }
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.set("cookie", cookieHeader);
    const session = await auth.api.getSession({ headers: forwardedHeaders });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: invalid or expired session" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const body = await request.json();
    const { name, email, company, status = "Pending", campaignId, lastContactDate } = body;

    if (!name || !email || !campaignId) {
      return NextResponse.json(
        { success: false, error: "Name, email, and campaign ID are required" },
        { status: 400 }
      );
    }

    // Verify campaign belongs to user
    const campaign = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)))
      .limit(1);

    if (campaign.length === 0) {
      return NextResponse.json(
        { success: false, error: "Campaign not found or access denied" },
        { status: 404 }
      );
    }

    // Create new lead
    const [newLead] = await db
      .insert(leads)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim(),
        status: status as "Pending" | "Contacted" | "Responded" | "Converted",
        lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
        campaignId,
      })
      .returning({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        status: leads.status,
        lastContactDate: leads.lastContactDate,
        createdAt: leads.createdAt,
        campaignId: leads.campaignId,
      });

    return NextResponse.json({
      success: true,
      data: newLead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create lead" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    if (!cookieHeader.includes("better-auth.session_token")) {
      return NextResponse.json({ error: "Unauthorized: missing session cookie" }, { status: 401 });
    }
    const forwardedHeaders = new Headers(request.headers);
    forwardedHeaders.set("cookie", cookieHeader);
    const session = await auth.api.getSession({ headers: forwardedHeaders });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: invalid or expired session" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const body = await request.json();
    const { id, name, email, company, status, lastContactDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Verify lead belongs to user's campaign
    const existingLead = await db
      .select({ 
        id: leads.id,
        campaignId: leads.campaignId,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(
        and(
          eq(leads.id, id),
          eq(campaigns.userId, userId)
        )
      )
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json(
        { success: false, error: "Lead not found or access denied" },
        { status: 404 }
      );
    }

    // Update lead
    const [updatedLead] = await db
      .update(leads)
      .set({
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(company !== undefined && { company: company?.trim() }),
        ...(status && { status }),
        ...(lastContactDate !== undefined && { 
          lastContactDate: lastContactDate ? new Date(lastContactDate) : null 
        }),
      })
      .where(eq(leads.id, id))
      .returning({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        status: leads.status,
        lastContactDate: leads.lastContactDate,
        createdAt: leads.createdAt,
        campaignId: leads.campaignId,
      });

    return NextResponse.json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update lead" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Replace with actual better-auth session validation
    const userId = "demo-user-id";
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Verify lead belongs to user's campaign
    const existingLead = await db
      .select({ 
        id: leads.id,
        campaignId: leads.campaignId,
      })
      .from(leads)
      .leftJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(
        and(
          eq(leads.id, id),
          eq(campaigns.userId, userId)
        )
      )
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json(
        { success: false, error: "Lead not found or access denied" },
        { status: 404 }
      );
    }

    // Delete lead
    const [deletedLead] = await db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        status: leads.status,
        lastContactDate: leads.lastContactDate,
        createdAt: leads.createdAt,
        campaignId: leads.campaignId,
      });

    return NextResponse.json({
      success: true,
      data: deletedLead,
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete lead" 
      },
      { status: 500 }
    );
  }
}
