import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseOfferingId = searchParams.get("courseOfferingId");

  if (!courseOfferingId) return NextResponse.json({ error: "Missing offering ID" }, { status: 400 });

  try {
    const sessions = await prisma.classSession.findMany({
      where: { courseOfferingId },
      include: {
        records: true,
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { courseOfferingId, date, students } = await req.json(); // students: [{id, status}]

    const classSession = await prisma.classSession.create({
        data: {
            courseOfferingId,
            instructorId: session.user.id,
            date: new Date(date),
            records: {
                create: students.map((s: any) => ({
                    studentId: s.id,
                    status: s.status
                }))
            }
        },
        include: { records: true }
    });

    return NextResponse.json(classSession);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
