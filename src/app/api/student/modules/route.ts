import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session || session.user.role !== "STUDENT") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  if (!courseOfferingId) {
    return new NextResponse("Missing courseOfferingId", { status: 400 });
  }

  try {
    const modules = await prisma.module.findMany({
      where: {
        courseOfferingId: courseOfferingId,
      },
      include: {
        lessons: {
          include: {
            resources: true,
          },
        },
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
