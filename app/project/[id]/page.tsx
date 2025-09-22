import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, ExternalLink, Github, Play, Users, Calendar, Tag, Sparkles, Lightbulb } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { VoteButton } from "@/components/vote-button"
import { supabase } from "@/lib/supabase"

interface Member {
  name: string
  role?: string
  school?: string
}

interface Project {
  id: number
  title: string
  description: string
  theme: number[]
  teamName: string
  members: Member[]
  thumbnail: string
  demoUrl?: string
  sourceUrl?: string
  videoUrl?: string
}

const themeIcons = {
  "赛博 AI 20X5": Sparkles,
  "重新发现社会": Users,
  "科技改变生活": Lightbulb,
}

const themeColors = {
  "赛博 AI 20X5": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "重新发现社会": "bg-green-500/10 text-green-400 border-green-500/20",
  "科技改变生活": "bg-orange-500/10 text-orange-400 border-orange-500/20",
}

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

export const dynamicParams = false

export async function generateStaticParams() {
  const { data, error } = await supabase.from('project').select('id')
  if (error || !data) {
    console.error('生成静态参数失败:', error)
    return []
  }
  return data.map((row: { id: number }) => ({ id: String(row.id) }))
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {

  // 从 Supabase 获取项目数据，只选择实际存在的列
  const { data, error } = await supabase
    .from('project')
    .select('id, title, description, theme, teamName, members, thumbnail, demoUrl, sourceUrl, videoUrl')
    .eq('id', Number(params.id))
    .single()

  if (error || !data) {
    console.error('加载项目失败:', error)
    notFound()
  }

  // 转换数据库数据格式
  const project: Project = {
    id: data.id,
    title: data.title ?? '',
    description: data.description ?? '',
    theme: Array.isArray(data.theme) ? data.theme : [],
    teamName: data.teamName ?? '',
    members: Array.isArray(data.members) ? data.members : [],
    thumbnail: data.thumbnail ?? '/placeholder.svg',
    demoUrl: data.demoUrl ?? undefined,
    sourceUrl: data.sourceUrl ?? undefined,
    videoUrl: data.videoUrl ?? undefined
  }

  const themeDisplayName = getThemeDisplayName(project.theme)
  // 对于多个主题，使用第一个主题的图标，或者默认图标
  const firstTheme = Array.isArray(project.theme) && project.theme.length > 0 ? project.theme[0] : 1
  const firstThemeName = themeNameMap[firstTheme] || "赛博 AI 20X5"
  const ThemeIcon = themeIcons[firstThemeName as keyof typeof themeIcons] || Sparkles

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
            <div className="flex flex-wrap gap-2">
              {Array.isArray(project.theme) && project.theme.map((themeNumber, index) => {
                const themeName = themeNameMap[themeNumber] || `主题${themeNumber}`
                const ThemeIcon = themeIcons[themeName as keyof typeof themeIcons] || Sparkles
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className={themeColors[themeName as keyof typeof themeColors]}
                  >
                    <ThemeIcon className="h-3 w-3 mr-1" />
                    {themeName}
                  </Badge>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-balance">{project.title}</h1>
            <p className="text-xl text-muted-foreground mb-6 text-pretty">{project.description}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {project.demoUrl && (
                <Button asChild>
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    在线演示
                  </a>
                </Button>
              )}

              {project.sourceUrl && (
                <Button asChild variant="outline">
                  <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    源码
                  </a>
                </Button>
              )}

              {project.videoUrl && (
                <Button asChild variant="outline">
                  <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Play className="h-4 w-4 mr-2" />
                    演示视频
                  </a>
                </Button>
              )}

              {/* Vote Button */}
              <VoteButton projectId={project.id.toString()} />
            </div>
          </div>

          {/* Main Image */}
          <div className="mb-8">
            <Image
              src={project.thumbnail || "/placeholder.svg"}
              alt={project.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg border border-border/50"
              draggable={false}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    团队信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{project.teamName}</h4>
                    <div className="space-y-3">
                      {project.members.map((member, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{(member?.name || '').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {[member.role, member.school].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
