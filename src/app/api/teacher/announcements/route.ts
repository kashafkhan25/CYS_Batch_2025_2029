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
    const announcements = await (prisma as any).announcement.findMany({
      where: { courseOfferingId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content, courseOfferingId } = await req.json();

    if (!title || !content || !courseOfferingId) {
      return NextResponse.json({ error: "Title, Content, and Offering ID are required" }, { status: 400 });
    }

    const newAnnouncement = await (prisma as any).announcement.create({
      data: {
        title,
        content,
        courseOfferingId,
      }
    });

    return NextResponse.json(newAnnouncement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, title, content } = await req.json();
    const updated = await prisma.announcement.update({
      where: { id },
      data: { title, content }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
