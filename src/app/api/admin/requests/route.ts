import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.registrationRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Create user
      await prisma.user.create({
        data: {
          email: request.email,
          name: request.name,
          passwordHash: request.passwordHash,
          role: request.role,
          rollNumber: request.rollNumber,
          batchId: request.batchId,
          isFirstLogin: true,
        },
      });

      // Update request status
      await prisma.registrationRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      });

      return NextResponse.json({ success: true, message: "User approved and created" });
    } else if (action === "REJECT") {
      await prisma.registrationRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "Request rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Process request error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
