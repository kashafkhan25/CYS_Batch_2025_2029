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
    const quizzes = await prisma.quiz.findMany({
      where: { courseOfferingId },
      include: {
        questions: true,
        _count: { select: { questions: true } }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, courseOfferingId, questions, dueDate } = await req.json();

    if (!title || !courseOfferingId || !questions) {
      return NextResponse.json({ error: "Title, Offering ID, and Questions are required" }, { status: 400 });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        courseOfferingId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        questions: {
            create: questions.map((q: any) => ({
                text: q.text,
                options: JSON.stringify(q.options),
                answer: q.answer
            }))
        }
      },
      include: { questions: true }
    });

    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error("Quiz creation error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, title, questions, dueDate } = await req.json();

    // Transaction to update quiz and questions
    const updated = await prisma.$transaction(async (tx) => {
        // Delete old questions
        await tx.question.deleteMany({ where: { quizId: id } });
        
        // Update quiz and recreate questions
        return await tx.quiz.update({
            where: { id },
            data: {
                title,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                questions: {
                    create: questions.map((q: any) => ({
                        text: q.text,
                        options: JSON.stringify(q.options),
                        answer: q.answer
                    }))
                }
            },
            include: { questions: true }
        });
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.quiz.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
