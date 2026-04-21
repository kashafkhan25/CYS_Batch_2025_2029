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
    const courses = await prisma.course.findMany({
      orderBy: { code: 'asc' }
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, title, description, credits } = await req.json();

    if (!code || !title) {
        return NextResponse.json({ error: "Code and Title are required" }, { status: 400 });
    }

    const now = { $date: new Date().toISOString() };
    await prisma.$runCommandRaw({
      insert: "Course",
      documents: [{
        code: code.toUpperCase().trim(),
        title: title.trim(),
        description: description?.trim() || null,
        credits: parseInt(credits) || 3,
        createdAt: now,
        updatedAt: now
      }]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Course code already exists." }, { status: 400 });
    }
    console.error("Course creation error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
