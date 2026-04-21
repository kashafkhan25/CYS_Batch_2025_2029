import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  try {
    const offerings = await prisma.courseOffering.findMany({
      where: batchId ? { batchId } : {},
      include: {
        course: true,
        teacher: true,
      },
    });
    return NextResponse.json(offerings);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  
    try {
      const { courseId, teacherId, batchId, semesterNum, section } = await req.json();
      const offering = await prisma.courseOffering.create({
        data: { courseId, teacherId, batchId, semesterNum, section }
      });
      return NextResponse.json(offering);
    } catch (error) { return new NextResponse("Error", { status: 500 }); }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  
    try {
      const { id, courseId, teacherId, semesterNum, section } = await req.json();
      const offering = await prisma.courseOffering.update({
        where: { id },
        data: { courseId, teacherId, semesterNum, section }
      });
      return NextResponse.json(offering);
    } catch (error) { return new NextResponse("Error", { status: 500 }); }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
  
    try {
      const { id } = await req.json();
      await prisma.courseOffering.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    } catch (error) { return new NextResponse("Error", { status: 500 }); }
}
