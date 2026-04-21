import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic") || "Cyber Security";

  // Mock recommendation engine
  const recommendations = [
      { id: "1", title: "Introduction to Networking", url: "https://www.youtube.com/watch?v=IPv4basics", platform: "YouTube" },
      { id: "2", title: "Linux for Beginners", url: "https://www.youtube.com/watch?v=ubuntuTutorial", platform: "YouTube" },
      { id: "3", title: "OWASP Top 10 Explained", url: "https://www.youtube.com/watch?v=securityFlaws", platform: "YouTube" }
  ];

  return NextResponse.json(recommendations);
}
