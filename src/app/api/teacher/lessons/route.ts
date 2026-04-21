import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, moduleId } = await req.json();

    if (!title || !moduleId) {
      return NextResponse.json({ error: "Title and Module ID are required" }, { status: 400 });
    }

    const newLesson = await prisma.lesson.create({
      data: {
        title,
        moduleId,
      }
    });

    return NextResponse.json(newLesson);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}

// Resource Logic (Mock S3 Upload interaction)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { lessonId, title, fileUrl } = await req.json();

        const resource = await prisma.resource.create({
            data: {
                title,
                fileUrl,
                lessonId
            }
        });

        return NextResponse.json(resource);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add resource" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, title, type } = await req.json(); // type to distinguish lesson vs resource updates if needed, or separate routes

        if (type === "RESOURCE") {
            const updated = await prisma.resource.update({
                where: { id },
                data: { title }
            });
            return NextResponse.json(updated);
        }

        const updatedLesson = await prisma.lesson.update({
            where: { id },
            data: { title }
        });
        return NextResponse.json(updatedLesson);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type");

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        if (type === "RESOURCE") {
            await prisma.resource.delete({ where: { id } });
        } else {
            await prisma.lesson.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
