import { NextRequest, NextResponse } from 'next/server'
import { voteFunctions } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  try {
    const votes = await voteFunctions.getProjectVotes(BigInt(projectId))
    return NextResponse.json({ votes })
  } catch (error) {
    console.error('获取票数错误:', error)
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    const success = await voteFunctions.incrementVote(BigInt(projectId))

    if (success) {
      const votes = await voteFunctions.getProjectVotes(BigInt(projectId))
      return NextResponse.json({ success: true, votes })
    } else {
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }
  } catch (error) {
    console.error('投票错误:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}