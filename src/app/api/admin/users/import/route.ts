import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { users } = await req.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let successCount = 0;
    const errors: any[] = [];

    // Process sequentially to easily handle bcrypt async and avoid DB connection pileups
    for (const user of users) {
      // Basic validation
      if (!user.email || !user.name) {
        errors.push({ email: user.email || "Unknown", reason: "Missing required fields" });
        continue;
      }

      const roleEnum = (user.role?.toUpperCase() as Role) || Role.STUDENT;

      try {
        // Generate a random provisional password (in production, generate and send an email link)
        const rawPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        await prisma.user.create({
          data: {
            email: user.email.toLowerCase().trim(),
            name: user.name.trim(),
            role: roleEnum,
            batchId: user.batchId || null,
            sectionId: user.sectionId || null,
            passwordHash,
          },
        });

        // Normally, we'd fire an email service here with the provisional password or a reset link.
        successCount++;
      } catch (e: any) {
        // Prisma Unique Constraint violation code is P2002
        if (e.code === 'P2002') {
           errors.push({ email: user.email, reason: "Email already exists" });
        } else {
           errors.push({ email: user.email, reason: e.message });
        }
      }
    }

    return NextResponse.json({ successCount, errors });

  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
