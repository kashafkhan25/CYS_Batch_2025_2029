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

  if (!courseOfferingId) {
    return new NextResponse("Missing courseOfferingId", { status: 400 });
  }

  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { batchId: true }
    });

    const whereClause: any = courseOfferingId 
      ? { courseOfferingId } 
      : { courseOffering: { batchId: user?.batchId } };

    const announcements = await (prisma as any).announcement.findMany({
      where: whereClause,
      include: {
        courseOffering: {
          include: { course: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
