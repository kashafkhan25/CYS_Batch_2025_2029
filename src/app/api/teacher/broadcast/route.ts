import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    // 1. Find all course offerings for this teacher
    const offerings = await prisma.courseOffering.findMany({
      where: {
        teacherId: session.user.id,
      },
    });

    if (offerings.length === 0) {
      return new NextResponse("No courses found for this teacher", { status: 404 });
    }

    // 2. Create an announcement for each offering
    const announcements = await Promise.all(
      offerings.map((offering) =>
        prisma.announcement.create({
          data: {
            title,
            content,
            courseOfferingId: offering.id,
          },
        })
      )
    );

    return NextResponse.json({ 
      message: "Broadcast sent successfully", 
      count: announcements.length 
    });
  } catch (error) {
    console.error("Broadcast Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
