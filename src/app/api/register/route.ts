import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

const client = new MongoClient(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { name, email, password, role, rollNumber, batchId } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await client.connect();
    const db = client.db(); // Auto-selects db from connection string
    
    // Check if user already exists
    const users = db.collection("User");
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Check if a pending request already exists
    const requests = db.collection("RegistrationRequest");
    const existingRequest = await requests.findOne({ email });
    if (existingRequest) {
      return NextResponse.json({ error: "A registration request is already pending for this email" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const request = await requests.insertOne({
      name,
      email,
      passwordHash,
      role,
      rollNumber: role === "STUDENT" ? rollNumber : null,
      batchId: role === "STUDENT" && batchId ? new ObjectId(batchId) : null,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, message: "Registration request submitted successfully. Please wait for admin approval." });
  } catch (error: any) {
    console.error("Native Mongo Registration Error:", error);
    return NextResponse.json({ error: "Failed to submit registration request", detail: error.message }, { status: 500 });
  }
}
