import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Current student's batch courses
    if (!session.user.batchId) {
        return NextResponse.json([]);
    }

    const courses = await prisma.courseOffering.findMany({
      where: { batchId: session.user.batchId },
      include: {
        course: { select: { code: true, title: true } },
      },
      orderBy: { semesterNum: 'asc' }
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Fetch student courses error:", error);
    return NextResponse.json({ error: "Failed to fetch your courses" }, { status: 500 });
  }
}
