import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [students, teachers, batches, courses] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.batch.count(),
      prisma.course.count(),
    ]);

    const recentActivity = [
        { id: 1, action: "System Audit", desc: "Successfully synchronized database records.", time: "Just now" },
        // We could fetch real recent additions here if we had an audit log
    ];

    return NextResponse.json({
      stats: { students, teachers, batches, courses },
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
