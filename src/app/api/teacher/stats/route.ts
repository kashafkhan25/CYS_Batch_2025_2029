import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // In a real app, filter by teacherId from session
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    const submissionCount = await prisma.submission.count()
    
    return NextResponse.json({
      students: studentCount,
      submissions: submissionCount
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
