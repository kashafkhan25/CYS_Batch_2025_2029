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
    const progress = await prisma.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        lesson: {
            module: {
                courseOfferingId: courseOfferingId
            }
        }
      },
      select: { lessonId: true }
    });

    return NextResponse.json(progress.map(p => p.lessonId));
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
        const { lessonId, completed } = await req.json();
        
        if (completed) {
            await prisma.lessonProgress.create({
                data: {
                    lessonId,
                    studentId: session.user.id,
                }
            });
        } else {
            await prisma.lessonProgress.deleteMany({
                where: {
                    lessonId,
                    studentId: session.user.id,
                }
            });
        }

        return new NextResponse("Success", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
