import { ProjectCard } from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Triangle, Sparkles, Users, Lightbulb } from "lucide-react"
import { supabase } from "@/lib/supabase"

/* 数据来源已切换为 Supabase project 表 */

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

export default async function HomePage() {
  // 主题序号到显示名称映射
  const themeNameMap: Record<number, string> = {
    1: "赛博 AI 20X5",
    2: "重新发现社会",
    3: "科技改变生活",
  }

  // 从 Supabase 拉取项目数据
  const { data, error } = await supabase
    .from('project')
    .select('id,title,description,theme,teamName,members,thumbnail,demoUrl,sourceUrl,videoUrl')

  if (error) {
    console.error('加载项目失败:', error)
  }

  // 将数据库数据映射为 ProjectCard 需要的展示结构
  const projects = (data || []).map((p: any) => ({
    id: String(p.id),
    title: p.title ?? '',
    description: p.description ?? '',
    // 保持 theme 为数字数组，ProjectCard 组件会处理显示
    theme: Array.isArray(p.theme) ? p.theme : [Number(p.theme)],
    teamName: p.teamName ?? '',
    members: Array.isArray(p.members) ? p.members : [],
    thumbnail: p.thumbnail ?? '/placeholder.svg',
    demoUrl: p.demoUrl ?? undefined,
    sourceUrl: p.sourceUrl ?? undefined,
    videoUrl: p.videoUrl ?? undefined,
  }))
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="favicon.png" className="h-8 w-8" />
                <div className="text-2xl font-bold text-balance">奇点·黑客松</div>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                作品展示
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="hidden md:inline">养正中学 × 季延中学 × 晋江一中 × 奇点之声</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">创新作品展示</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty">
              展示来自泉州地区优秀学生团队的创新项目，涵盖AI未来、社会科学普及和生活科技三大主题
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {Object.entries(themeIcons).map(([theme, Icon]) => (
                <Badge
                  key={theme}
                  variant="outline"
                  className={`px-4 py-2 text-sm ${themeColors[theme as keyof typeof themeColors]}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {theme}
                </Badge>
              ))}
            </div>
            <div className="flex gap-6 justify-center">
              <Button variant="outline" size="lg" className="btn btn-primary">
                <Link href="https://tcnlbejp56nf.feishu.cn/share/base/form/shrcnWVcXfolsLg6tXZhoeXRXSb">
                  立即报名
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="btn btn-secondary">
                <Link href="https://tcnlbejp56nf.feishu.cn/share/base/form/shrcnE0XuixwuEHHQ4wM1wRJclc">
                  提交作品
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="btn btn-primary">
                <Link href="/leaderboard">
                  查看排行榜
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">参赛作品</h2>
              <p className="text-muted-foreground">共收到 {projects.length} 个优秀作品，展示青少年的创新能力</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="./favicon.png" className="h-8 w-8" />
              <span className="text-lg font-semibold">奇点·黑客松</span>
            </div>
            <p className="text-muted-foreground mb-4">由养正中学稳健IT社联合奇点之声团队、季延中学、晋江一中共同举办</p>
            <p className="text-sm text-muted-foreground">
              技术支持：奇点之声 (singularity-v.com) | 活动邮箱：hackathon@surfish.top
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
