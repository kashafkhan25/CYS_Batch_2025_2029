import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const batches = await prisma.batch.findMany({
      include: {
        _count: {
          select: { users: { where: { role: "STUDENT" } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(batches.map((b: any) => ({
      ...b,
      studentCount: b._count.users
    })));
  } catch (error) {
    console.error("Fetch batches error:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, currentSemester } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Batch identifier is required" }, { status: 400 });
    }

    const now = new Date();
    await prisma.$runCommandRaw({
      insert: "Batch",
      documents: [
        {
          name: id.toUpperCase().trim(),
          currentSemester: parseInt(currentSemester) || 1,
          isActive: true,
          createdAt: { $date: now.toISOString() },
          updatedAt: { $date: now.toISOString() }
        }
      ]
    });

    const createdBatch = await prisma.batch.findUnique({
      where: { name: id.toUpperCase().trim() }
    });

    return NextResponse.json(createdBatch);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Batch identifier already exists." }, { status: 400 });
    }
    console.error("Create batch error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
