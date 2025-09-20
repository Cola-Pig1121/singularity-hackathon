import { NextResponse } from 'next/server'
import { voteFunctions } from '@/lib/supabase'

export async function GET() {
  try {
    const rankings = await voteFunctions.getVoteRankings()
    return NextResponse.json(rankings)
  } catch (error) {
    console.error('获取排行榜错误:', error)
    return NextResponse.json({ error: 'Failed to get leaderboard' }, { status: 500 })
  }
}