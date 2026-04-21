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
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: session.user.id,
        session: {
            courseOfferingId: courseOfferingId
        }
      },
      include: {
        session: {
            select: { date: true }
        }
      },
      orderBy: { session: { date: 'desc' } }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
