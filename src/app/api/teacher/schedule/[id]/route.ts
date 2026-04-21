import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const id = params.id;
    // Verify ownership
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { courseOffering: true },
    });

    if (!schedule || schedule.courseOffering.teacherId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.schedule.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
