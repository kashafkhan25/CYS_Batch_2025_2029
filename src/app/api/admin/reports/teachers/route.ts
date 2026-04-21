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
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const reportData = await Promise.all(
      teachers.map(async (teacher) => {
        const offerings = await prisma.courseOffering.findMany({
          where: { teacherId: teacher.id },
          include: {
            assignments: {
              include: { submissions: true },
            },
            modules: {
              include: { lessons: { include: { resources: true } } },
            },
          },
        });

        let totalSubmissions = 0;
        let gradedSubmissions = 0;
        let totalResources = 0;

        offerings.forEach((off) => {
          off.assignments.forEach((assign) => {
            totalSubmissions += assign.submissions.length;
            gradedSubmissions += assign.submissions.filter((s) => s.grade !== null).length;
          });
          off.modules.forEach((mod) => {
            mod.lessons.forEach((less) => {
              totalResources += less.resources.length;
            });
          });
        });

        return {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          coursesCount: offerings.length,
          gradingRate: totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 100,
          resourceCount: totalResources,
          activeStatus: offerings.length > 0 ? "ACTIVE" : "INACTIVE",
        };
      })
    );

    return NextResponse.json(reportData);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
