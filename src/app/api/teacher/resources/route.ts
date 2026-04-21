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
    const { title, url, type, lessonId } = await req.json();

    if (!title || !url || !type || !lessonId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        fileUrl: url,
        type,
        lessonId: lessonId,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });
  
    try {
      const { id, title, url, type } = await req.json();
      const resource = await prisma.resource.update({
        where: { id },
        data: { title, fileUrl: url, type }
      });
      return NextResponse.json(resource);
    } catch (error) { return new NextResponse("Error", { status: 500 }); }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });
  
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new NextResponse("Missing ID", { status: 400 });
  
    try {
      await prisma.resource.delete({ where: { id } });
      return new NextResponse(null, { status: 204 });
    } catch (error) { return new NextResponse("Error", { status: 500 }); }
}
