import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { grade, feedback } = await req.json();
    const { id: submissionId } = await params;

    // Verify ownership
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { courseOffering: true },
        },
      },
    });

    if (!submission || submission.assignment.courseOffering.teacherId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parseInt(grade),
        feedback,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
