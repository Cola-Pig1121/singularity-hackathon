"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ExternalLink, Github, Play, Users, Sparkles, Lightbulb, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { voteFunctions } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface Member {
  name: string
  role?: string
  school?: string
}

interface Project {
  id: string
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

interface ProjectCardProps {
  project: Project
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

export function ProjectCard({ project }: ProjectCardProps) {
  const getThemeDisplayName = (themeNumber: number) => {
    const themeMap: Record<number, string> = {
      1: "赛博 AI 20X5",
      2: "重新发现社会", 
      3: "科技改变生活"
    }
    return themeMap[themeNumber] || "未知主题"
  }
  const [votes, setVotes] = useState(0)

  useEffect(() => {
    loadVotes()
  }, [project.id])

  const loadVotes = async () => {
    try {
      const voteCount = await voteFunctions.getProjectVotes(Number(project.id))
      setVotes(voteCount)
    } catch (error) {
      console.error('加载票数失败:', error)
    }
  }

  return (
    <Card className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={project.thumbnail || "/placeholder.svg"}
            alt={project.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {project.theme.map((themeNumber, index) => {
              const themeName = getThemeDisplayName(themeNumber)
              const ThemeIcon = themeIcons[themeName as keyof typeof themeIcons] || Sparkles
              return (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${themeColors[themeName as keyof typeof themeColors]} backdrop-blur-sm text-xs`}
                >
                  <ThemeIcon className="h-3 w-3 mr-1" />
                  {themeName}
                </Badge>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-balance group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-muted-foreground text-sm text-pretty line-clamp-2">{project.description}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{project.teamName}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {project.members.slice(0, 4).map((member, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">{(member?.name || '').charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {project.members.length > 4 && (
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">+{project.members.length - 4}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{project.members.length} 名成员</span>
            </div>
          </div>

          {/* Vote Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-red-500" />
            <span>{votes} 票</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/project/${project.id}`}>查看详情</Link>
        </Button>

        <div className="flex gap-1">
          {project.demoUrl && (
            <Button asChild size="sm" variant="outline">
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          {project.sourceUrl && (
            <Button asChild size="sm" variant="outline">
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          )}

          {project.videoUrl && (
            <Button asChild size="sm" variant="outline">
              <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                <Play className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
