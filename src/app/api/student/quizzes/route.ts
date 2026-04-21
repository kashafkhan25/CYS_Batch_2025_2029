import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { quizId, answers } = await req.json(); // answers: { questionId: submittedAnswer }

    if (!quizId || !answers) {
      return NextResponse.json({ error: "QuizId and Answers are required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Calculate Score
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score += 1;
      }
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: session.user.id,
        score,
      }
    });

    return NextResponse.json({ score, total: quiz.questions.length, attemptId: attempt.id });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseOfferingId = searchParams.get("courseOfferingId");
    const quizId = searchParams.get("quizId");

    try {
        if (quizId) {
            // Get specific quiz details (without answers)
            const quiz = await prisma.quiz.findUnique({
                where: { id: quizId },
                include: {
                    questions: {
                        select: { id: true, text: true, options: true }
                    },
                    attempts: {
                        where: { studentId: session.user.id },
                        orderBy: { submittedAt: 'desc' },
                        take: 1
                    }
                }
            });
            return NextResponse.json(quiz);
        }

        if (courseOfferingId) {
            // List quizzes for course
            const quizzes = await prisma.quiz.findMany({
                where: { courseOfferingId },
                include: {
                    attempts: {
                        where: { studentId: session.user.id },
                        orderBy: { submittedAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { dueDate: 'asc' }
            });
            return NextResponse.json(quizzes);
        }

        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    } catch (error) {
        console.error("Fetch quizzes error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
