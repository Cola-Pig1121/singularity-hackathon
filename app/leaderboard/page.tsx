'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Crown, Medal, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { voteFunctions } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

// 主题序号到显示名称映射
const themeNameMap: Record<number, string> = {
  1: "赛博 AI 20X5",
  2: "重新发现社会",
  3: "科技改变生活",
}

// 获取主题显示名称
const getThemeDisplayName = (theme: number[]): string => {
  if (Array.isArray(theme) && theme.length > 0) {
    // 显示所有主题，用逗号分隔
    const themeNames = theme.map(t => themeNameMap[t] || `主题${t}`)
    return themeNames.join(', ')
  }
  return "未知主题"
}

interface VoteRanking {
  project_id: number
  votes: number
  project?: {
    id: number
    title: string
    teamName: string
    theme: number[]
  }
}

interface SupabaseVoteRanking {
  project_id: number
  votes: number
  project: {
    id: number
    title: string
    teamName: string
    theme: number[]
  }
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<VoteRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    try {
      const rankingsData = await voteFunctions.getVoteRankings()
      // 转换Supabase返回的数据格式
      const formattedRankings: VoteRanking[] = rankingsData.map((item: any) => ({
        project_id: item.project_id,
        votes: item.votes,
        project: item.project ? {
          id: item.project.id,
          title: item.project.title,
          teamName: item.project.teamName,
          theme: item.project.theme
        } : undefined
      }))
      setRankings(formattedRankings)
    } catch (error) {
      console.error('加载排行榜失败:', error)
      toast({
        title: '加载失败',
        description: '无法加载排行榜数据',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadRankings()
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />
    return <Trophy className="h-5 w-5 text-muted-foreground" />
  }

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 border-yellow-500/30'
    if (index === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30'
    if (index === 2) return 'bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-amber-600/30'
    return 'bg-card/50 border-border/50'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-pattern">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">加载排行榜中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-2xl font-bold">投票排行榜</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{rankings.length}</div>
                  <div className="text-sm text-muted-foreground">参赛项目</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {rankings.reduce((total, ranking) => total + ranking.votes, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">总票数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {rankings[0]?.votes || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">最高票数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rankings List */}
          <div className="space-y-4">
            {rankings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">暂无投票数据</h3>
                  <p className="text-muted-foreground">快去为你喜欢的项目投票吧！</p>
                </CardContent>
              </Card>
            ) : (
              rankings.map((ranking, index) => {
                const project = ranking.project
                return (
                  <Card
                    key={ranking.project_id}
                    className={`border-2 transition-all hover:shadow-lg ${getRankColor(index)}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Rank Number */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border-2">
                          <div className="flex items-center gap-1">
                            {getRankIcon(index)}
                            <span className="text-lg font-bold">{index + 1}</span>
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-1 truncate">
                            {project?.title || `项目 ${ranking.project_id}`}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{project?.teamName || '未知团队'}</span>
                            <span>•</span>
                            <div className="flex flex-wrap gap-1">
                              {project?.theme && Array.isArray(project.theme) ? (
                                project.theme.map((themeNumber, index) => {
                                  const themeName = themeNameMap[themeNumber] || `主题${themeNumber}`
                                  return (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {themeName}
                                    </Badge>
                                  )
                                })
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  未知主题
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Votes */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {ranking.votes}
                          </div>
                          <div className="text-sm text-muted-foreground">票</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                返回首页
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/project/${rankings[0]?.project_id || 1}`}>
                查看第一名
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}