import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { batchId: true }
    });

    const whereClause: any = courseOfferingId 
      ? { courseOfferingId } 
      : { courseOffering: { batchId: user?.batchId } };

    const assignments = await (prisma as any).assignment.findMany({
      where: whereClause,
      include: {
        courseOffering: {
          include: { course: true }
        },
        submissions: {
          where: {
            studentId: session.user.id
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { assignmentId, fileUrl } = await req.json();
        
        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                studentId: session.user.id,
                fileUrl,
            }
        });

        return NextResponse.json(submission);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
