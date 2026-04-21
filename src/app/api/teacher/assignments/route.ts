import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  if (!courseOfferingId) return NextResponse.json({ error: "Missing offering ID" }, { status: 400 });

  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseOfferingId },
      include: {
        submissions: {
          where: { studentId: session.user.id }
        },
        _count: { select: { submissions: true } }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, courseOfferingId, dueDate } = await req.json();

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseOfferingId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }
    });

    return NextResponse.json(newAssignment);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, title, description, dueDate } = await req.json();
    const updated = await prisma.assignment.update({
      where: { id },
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : null }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Handle submissions cascade? If schema has onDelete: Cascade it works
    await prisma.assignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}

// Student Submission API (Mock S3 Link)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { assignmentId, fileUrl } = await req.json();

        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                studentId: session.user.id,
                fileUrl
            }
        });

        return NextResponse.json(submission);
    } catch (error) {
        return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
    }
}
