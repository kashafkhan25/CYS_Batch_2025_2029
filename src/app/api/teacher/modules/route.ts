import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  if (!courseOfferingId) return NextResponse.json({ error: "Missing offering ID" }, { status: 400 });

  try {
    const modules = await prisma.module.findMany({
      where: { courseOfferingId },
      include: {
        lessons: {
            include: { resources: true }
        }
      },
      orderBy: { id: 'asc' } // Placeholder for ordering field to be added later
    });
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, courseOfferingId } = await req.json();

    if (!title || !courseOfferingId) {
      return NextResponse.json({ error: "Title and Offering ID are required" }, { status: 400 });
    }

    const newModule = await prisma.module.create({
      data: {
        title,
        courseOfferingId,
      }
    });

    return NextResponse.json(newModule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, title } = await req.json();

    if (!id || !title) {
      return NextResponse.json({ error: "Module ID and title are required" }, { status: 400 });
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: { title }
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing module ID" }, { status: 400 });

    // Prisma will handle cascades if defined in schema, but let's be safe or just trust schema
    await prisma.module.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
