import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = await prisma.courseOffering.findMany({
      where: { teacherId: session.user.id },
      include: {
        course: { select: { code: true, title: true } },
        batch: { select: { id: true, currentSemester: true } },
      },
      orderBy: { batchId: 'asc' }
    });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Fetch teacher courses error:", error);
    return NextResponse.json({ error: "Failed to fetch your courses" }, { status: 500 });
  }
}
