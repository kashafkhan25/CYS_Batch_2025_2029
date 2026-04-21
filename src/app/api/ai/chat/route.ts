import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message, context } = await req.json();

    // In a real scenario, this would call Gemini API
    // For now, we mock a helpful educational response
    const mockResponses = [
        "That's a great question about Cyber Security. Have you checked the latest lecture notes on Linux Basics?",
        "I can help with that. The BZU LMS allows you to track your attendance in the dashboard.",
        "To submit your assignment, go to the course assessments tab and click 'View & Submit'.",
        "Cyber security is a vast field. Focus on understanding the core principles first."
    ];

    const reply = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
