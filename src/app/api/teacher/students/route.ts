import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  if (!courseOfferingId) return NextResponse.json({ error: "Missing offering ID" }, { status: 400 });

  try {
    const offering = await prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      select: { batchId: true }
    });

    if (!offering) return NextResponse.json({ error: "Offering not found" }, { status: 404 });

    const students = await prisma.user.findMany({
      where: { 
        batchId: offering.batchId,
        role: "STUDENT"
      },
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
