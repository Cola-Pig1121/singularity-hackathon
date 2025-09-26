'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProjectCard } from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Users, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"
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

// 主题详细信息
const themeDetails = {
  "赛博 AI 20X5": {
    title: "赛博 AI 20X5",
    description: "我们正处在一个由人工智能深刻改变的时代。AI 不再是遥远的幻想，它已经融入我们的生活，重塑着世界秩序。它在艺术、科学、医疗、交通等领域的应用，每天都在拓展着人类的边界。AI的未来充满无限可能，而我们相信，这份未来将由我们共同书写。到了 20X5 年，我们的世界会变成什么样？",
    requirements: "必须提交单个 HTML 文件（可附带静态资源，以 Zip 压缩包格式提交），确保可直接在浏览器中运行，不依赖本地服务端。代码由AI完成的部分需达到 70% 以上（需提供AI对话记录证明）。",
    awards: "一等奖：1名，奖金 100 元；二等奖：3名，奖金 50 元；三等奖：5名，奖金 10 元"
  },
  "重新发现社会": {
    title: "重新发现社会",
    description: "经济学、法学、社会学、心理学、传播学……社会科学与现代社会生活息息相关，然而对大多数人来说却相对陌生。如何将艰深晦涩的专业概念变得平易近人，为大众揭开社会科学的神秘面纱？",
    requirements: "",
    awards: "一等奖：1名，奖金 100 元；二等奖：2名，奖金 50 元"
  },
  "科技改变生活": {
    title: "科技改变生活",
    description: "有不少发明因懒而生。生活中小小的痛点，可能就是创新的源泉。即使只有一个人需要，你的创意也能在科技助力下真切地改变生活。",
    requirements: "",
    awards: "一等奖：1名，奖金 100 元；二等奖：2名，奖金 50 元；三等奖：5名，奖金 15 元"
  }
}

const ITEMS_PER_PAGE = 9

export default function HomePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedProjects, setDisplayedProjects] = useState<any[]>([])
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [focusedTimelineNode, setFocusedTimelineNode] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // 创建观察器引用
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 处理section展开/折叠
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const isOpen = prev.has(sectionId)
      // 手风琴模式：仅保留当前展开项；如果当前已展开则全部折叠
      return isOpen ? new Set() : new Set([sectionId])
    })
  }

  // 主题序号到显示名称映射
  const themeNameMap: Record<number, string> = {
    1: "赛博 AI 20X5",
    2: "重新发现社会",
    3: "科技改变生活",
  }

  // 获取项目数据
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project')
        .select('id,title,description,theme,teamName,members,thumbnail,demoUrl,sourceUrl,videoUrl')

      if (error) {
        console.error('加载项目失败:', error)
        return
      }

      // 将数据库数据映射为 ProjectCard 需要的展示结构
      const mappedProjects = (data || []).map((p: any) => ({
        id: String(p.id),
        title: p.title ?? '',
        description: p.description ?? '',
        theme: Array.isArray(p.theme) ? p.theme : [Number(p.theme)],
        teamName: p.teamName ?? '',
        members: Array.isArray(p.members) ? p.members : [],
        thumbnail: p.thumbnail ?? '/placeholder.svg',
        demoUrl: p.demoUrl ?? undefined,
        sourceUrl: p.sourceUrl ?? undefined,
        videoUrl: p.videoUrl ?? undefined,
      }))

      setProjects(mappedProjects)
    } catch (error) {
      console.error('获取项目数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 懒加载实现 - 根据当前页面更新显示的项目
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setDisplayedProjects(projects.slice(0, endIndex))
  }, [projects, currentPage])

  // 初始化数据
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 设置滚动动画观察器
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute('data-section')
          if (sectionId) {
            setVisibleSections(prev => {
              const newSet = new Set(prev)
              if (entry.isIntersecting) {
                newSet.add(sectionId)
              } else {
                newSet.delete(sectionId)
              }
              return newSet
            })
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    )

    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('[data-section]')
    animatedElements.forEach(el => {
      if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // 计算总页数
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE)

  // 处理页面切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到作品区域
    document.getElementById('projects-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisiblePages - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">奇点·黑客松</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty">
              展示来自泉州地区优秀学生团队的创新项目，涵盖三大创新主题
            </p>
          </div>
        </div>
      </section>

      {/* 活动主题介绍 */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 活动标题 */}
          <div
            className={`mb-16 transition-all duration-1000 hover:scale-110 cursor-pointer bg-card/50 rounded-lg p-8 ${visibleSections.has('hero-title')
              ? 'transform scale-105 opacity-100 blur-none'
              : 'transform scale-90 opacity-0 blur-sm translate-y-8'
              }`}
            data-section="hero-title"
          >
            <div className="text-center mb-8">
              <div className="text-sm font-mono text-primary mb-2">SINGULARITY</div>
              <div className="text-sm font-mono text-primary mb-8">HACKATHON 2025</div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-primary">7</span>天创新之旅
              </h2>
              <p className="text-lg text-muted-foreground">让最疯狂的想法变为现实</p>
            </div>

            <div className="text-center">
              <h3 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="text-primary">创新</span>无界限
              </h3>
              <p className="text-lg text-muted-foreground">每一个创意都值得被看见</p>
            </div>
          </div>

          {/* 活动详细介绍 */}
          <div className="space-y-16">
            {/* 活动背景 */}
            <div
              className={`transition-all duration-1000 bg-card/50 rounded-lg overflow-hidden ${visibleSections.has('background')
                ? 'transform scale-105 opacity-100 blur-none'
                : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                }`}
              data-section="background"
            >
              {/* 可点击的标题区域 */}
              <div
                className="relative p-8 hover:bg-card/70 transition-all duration-300 group"
              >
                <div className="text-sm font-mono text-primary mb-4">ABOUT</div>
                <div className="text-sm font-mono text-primary mb-8">BACKGROUND</div>
                <h3 className="text-3xl md:text-4xl font-bold mb-0 relative inline-block">
                  活动背景与目的
                </h3>

              </div>

              {/* 内容区域 */}
              <div className="transition-all duration-500 ease-in-out max-h-none opacity-100">
                <div className="px-8 pb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    为了<span className="text-primary font-semibold">激发青少年对科技的兴趣，培养创新意识</span>，同时庆祝今年的国庆和中秋双节，
                    <span className="text-primary font-semibold">养正中学稳健 IT 社联合养正中学、季延中学、晋江一中和奇点之声团队</span>特举办此次线上黑客松活动。
                  </p>
                </div>
              </div>
            </div>

            {/* 活动进程 */}
            <div
              className={`transition-all duration-1000 bg-card/50 rounded-lg p-8 ${visibleSections.has('schedule')
                ? 'transform scale-105 opacity-100 blur-none'
                : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                }`}
              data-section="schedule"
            >
              <div className="text-sm font-mono text-primary mb-4">SCHEDULE</div>
              <div className="text-sm font-mono text-primary mb-8">TIMELINE</div>
              <h3 className="text-3xl md:text-4xl font-bold mb-8">活动进程</h3>

              {/* 横向时间轴 */}
              <div className="relative">
                {/* 时间轴线 - 聚焦时隐藏 */}
                <div className={`absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full transform -translate-y-1/2 transition-all duration-500 ${focusedTimelineNode !== null ? 'opacity-0' : 'opacity-100'
                  }`}></div>

                {/* 时间节点容器 */}
                <div className="space-y-8">
                  {/* 整个时间轴容器 - 统一的鼠标事件处理 */}
                  <div
                    className="relative"
                    onMouseLeave={() => setFocusedTimelineNode(null)}
                  >
                    {/* 节点行 */}
                    <div className="flex justify-between items-center relative z-10 px-4 pb-8">
                      {/* 报名阶段 */}
                      <div
                        className={`relative flex flex-col items-center transition-all duration-500 ${focusedTimelineNode !== null && focusedTimelineNode !== 0 ? 'opacity-20 blur-sm scale-75' : ''
                          }`}
                        onMouseEnter={() => setFocusedTimelineNode(0)}
                      >
                        <div className={`w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg transition-all duration-500 cursor-pointer relative z-50 ${focusedTimelineNode === 0 ? 'scale-300 shadow-2xl' : 'hover:scale-150'
                          }`}></div>
                        <span className={`text-xs text-muted-foreground mt-2 text-center transition-all duration-500 ${focusedTimelineNode === 0 ? 'opacity-0' : ''
                          }`}>9/25-9/30</span>
                      </div>

                      {/* 开发阶段 */}
                      <div
                        className={`relative flex flex-col items-center transition-all duration-500 ${focusedTimelineNode !== null && focusedTimelineNode !== 1 ? 'opacity-20 blur-sm scale-75' : ''
                          }`}
                        onMouseEnter={() => setFocusedTimelineNode(1)}
                      >
                        <div className={`w-6 h-6 bg-green-500 rounded-full border-4 border-background shadow-lg transition-all duration-500 cursor-pointer relative z-50 ${focusedTimelineNode === 1 ? 'scale-300 shadow-2xl' : 'hover:scale-150'
                          }`}></div>
                        <span className={`text-xs text-muted-foreground mt-2 text-center transition-all duration-500 ${focusedTimelineNode === 1 ? 'opacity-0' : ''
                          }`}>10/1-10/7</span>
                      </div>

                      {/* 评审阶段 */}
                      <div
                        className={`relative flex flex-col items-center transition-all duration-500 ${focusedTimelineNode !== null && focusedTimelineNode !== 2 ? 'opacity-20 blur-sm scale-75' : ''
                          }`}
                        onMouseEnter={() => setFocusedTimelineNode(2)}
                      >
                        <div className={`w-6 h-6 bg-blue-500 rounded-full border-4 border-background shadow-lg transition-all duration-500 cursor-pointer relative z-50 ${focusedTimelineNode === 2 ? 'scale-300 shadow-2xl' : 'hover:scale-150'
                          }`}></div>
                        <span className={`text-xs text-muted-foreground mt-2 text-center transition-all duration-500 ${focusedTimelineNode === 2 ? 'opacity-0' : ''
                          }`}>10/8-10/9</span>
                      </div>

                      {/* 结果公布 */}
                      <div
                        className={`relative flex flex-col items-center transition-all duration-500 ${focusedTimelineNode !== null && focusedTimelineNode !== 3 ? 'opacity-20 blur-sm scale-75' : ''
                          }`}
                        onMouseEnter={() => setFocusedTimelineNode(3)}
                      >
                        <div className={`w-6 h-6 bg-yellow-500 rounded-full border-4 border-background shadow-lg transition-all duration-500 cursor-pointer relative z-50 ${focusedTimelineNode === 3 ? 'scale-300 shadow-2xl' : 'hover:scale-150'
                          }`}></div>
                        <span className={`text-xs text-muted-foreground mt-2 text-center transition-all duration-500 ${focusedTimelineNode === 3 ? 'opacity-0' : ''
                          }`}>10/10</span>
                      </div>
                    </div>

                    {/* 详细信息区域 - 简洁文字浮窗 */}
                    <div className={`transition-all duration-500 overflow-hidden ${focusedTimelineNode !== null ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      {/* 报名阶段详情 */}
                      {focusedTimelineNode === 0 && (
                        <div className="text-center py-6 px-4">
                          <h4 className="text-3xl md:text-4xl font-bold mb-4 text-primary">报名阶段</h4>
                          <p className="text-xl text-primary font-semibold mb-4">9月25日 - 9月30日</p>
                          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            参赛队伍通过指定平台完成报名，提交队伍信息。这是整个黑客松的起点，
                            所有有创意想法的同学都可以在这个阶段组建团队，准备迎接挑战。
                          </p>
                        </div>
                      )}

                      {/* 开发阶段详情 */}
                      {focusedTimelineNode === 1 && (
                        <div className="text-center py-6 px-4">
                          <h4 className="text-3xl md:text-4xl font-bold mb-4 text-green-500">开发阶段</h4>
                          <p className="text-xl text-green-500 font-semibold mb-4">10月1日 - 10月7日</p>
                          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            参赛者进行项目开发，这是最激动人心的7天！团队成员将把创意转化为现实，
                            最终提交截止时间为<span className="text-green-500 font-semibold">10月7日23:59</span>。记住，创新没有界限！
                          </p>
                        </div>
                      )}

                      {/* 评审阶段详情 */}
                      {focusedTimelineNode === 2 && (
                        <div className="text-center py-6 px-4">
                          <h4 className="text-3xl md:text-4xl font-bold mb-4 text-blue-500">评审阶段</h4>
                          <p className="text-xl text-blue-500 font-semibold mb-4">10月8日 - 10月9日</p>
                          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            评审团队依据评分标准对所有参赛作品进行评审。专业的评委将从<span className="text-blue-500 font-semibold">创新性、
                              技术实现、用户体验</span>等多个维度对作品进行全面评估。
                          </p>
                        </div>
                      )}

                      {/* 结果公布详情 */}
                      {focusedTimelineNode === 3 && (
                        <div className="text-center py-6 px-4">
                          <h4 className="text-3xl md:text-4xl font-bold mb-4 text-yellow-500">结果公布</h4>
                          <p className="text-xl text-yellow-500 font-semibold mb-4">10月10日</p>
                          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            激动人心的时刻！通过公众号公布获奖名单以及各队伍得分详情。
                            无论结果如何，每一个参与者都是<span className="text-yellow-500 font-semibold">创新路上的勇士</span>！
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 参与对象 */}
            <div
              className={`transition-all duration-1000 bg-card/50 rounded-lg overflow-hidden ${visibleSections.has('participants')
                ? 'transform scale-105 opacity-100 blur-none'
                : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                }`}
              data-section="participants"
            >
              {/* 可点击的标题区域 */}
              <div
                className="relative p-8 hover:bg-card/70 transition-all duration-300 group"
              >
                <div className="text-sm font-mono text-primary mb-4">WHO CAN</div>
                <div className="text-sm font-mono text-primary mb-8">PARTICIPATE</div>
                <h3 className="text-3xl md:text-4xl font-bold mb-0 relative inline-block">
                  参与对象
                </h3>

              </div>

              {/* 内容区域 */}
              <div className="transition-all duration-500 ease-in-out max-h-none opacity-100">
                <div className="px-8 pb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    由<span className="text-primary font-semibold">主要面向泉州市范围内的学生（18岁及以下），其他地区符合条件的朋友们，若有意向也可以参加</span>进行自由组队，以团队身份参加比赛。
                    <span className="text-primary font-semibold">每个团队至少一人，最多四人</span>。
                  </p>
                </div>
              </div>
            </div>

            {/* 三大主题 */}
            <div className="space-y-12">
              <div
                className={`transition-all duration-1000 bg-card/50 rounded-lg overflow-hidden ${visibleSections.has('themes-title')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="themes-title"
              >
                {/* 可点击的标题区域 */}
                <div
                  className="relative p-8 cursor-pointer hover:bg-card/70 transition-all duration-300 group"
                  onClick={() => toggleSection('themes')}
                >
                  <h3 className="text-3xl md:text-4xl font-bold mb-0 relative inline-block">
                    活动主题
                    {/* 悬停下划线动画 */}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
                  </h3>
                  {/* 展开/折叠提示 + 指示器 */}
                  <span className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:inline">
                    {expandedSections.has('themes') ? '点击此处折叠' : '点击此处展开'}
                  </span>
                  <div className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ${expandedSections.has('themes') ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 可折叠的主题内容区域 */}
              <div className={`transition-all duration-500 ease-in-out space-y-12 ${expandedSections.has('themes') ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>

                {/* 主题1 */}
                <div
                  className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('theme-1')
                    ? 'transform scale-105 opacity-100 blur-none'
                    : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                    }`}
                  data-section="theme-1"
                >
                  <h4 className="text-3xl md:text-4xl font-bold mb-6">
                    1. <span className="text-primary">赛博 AI 20X5</span>
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    我们正处在一个由人工智能深刻改变的时代。<span className="text-primary">AI 不再是遥远的幻想，它已经融入我们的生活，重塑着世界秩序</span>。它在艺术、科学、医疗、交通等领域的应用，每天都在拓展着人类的边界。AI的未来充满无限可能，而我们相信，这份未来将由我们共同书写。<span className="text-primary font-semibold">到了 20X5 年，我们的世界会变成什么样？</span>
                  </p>
                  <div className="text-base text-muted-foreground mb-3">
                    <span className="text-primary font-semibold">特殊要求：</span>必须提交单个 HTML 文件（可附带静态资源，以 Zip 压缩包格式提交），确保可直接在浏览器中运行，不依赖本地服务端。代码由AI完成的部分需达到 70% 以上（需提供AI对话记录证明）。
                  </div>
                  <div className="text-base text-muted-foreground mb-3">
                    <span className="text-primary font-semibold">奖项设置：</span>一等奖：1名，奖金 100 元；二等奖：3名，奖金 50 元；三等奖：5名，奖金 10 元
                  </div>
                </div>

                {/* 主题2 */}
                <div
                  className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('theme-2')
                    ? 'transform scale-105 opacity-100 blur-none'
                    : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                    }`}
                  data-section="theme-2"
                >
                  <h4 className="text-3xl md:text-4xl font-bold mb-6">
                    2. <span className="text-primary">重新发现社会</span>
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    经济学、法学、社会学、心理学、传播学……<span className="text-primary">社会科学与现代社会生活息息相关，然而对大多数人来说却相对陌生</span>。<span className="text-primary font-semibold">如何将艰深晦涩的专业概念变得平易近人，为大众揭开社会科学的神秘面纱？</span>
                  </p>
                  <div className="text-base text-muted-foreground mb-3">
                    <span className="text-primary font-semibold">奖项设置：</span>一等奖：1名，奖金 100 元；二等奖：2名，奖金 50 元
                  </div>
                </div>

                {/* 主题3 */}
                <div
                  className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('theme-3')
                    ? 'transform scale-105 opacity-100 blur-none'
                    : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                    }`}
                  data-section="theme-3"
                >
                  <h4 className="text-3xl md:text-4xl font-bold mb-6">
                    3. <span className="text-primary">科技改变生活</span>
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    <span className="text-primary">有不少发明因懒而生</span>。生活中小小的痛点，可能就是创新的源泉。<span className="text-primary font-semibold">即使只有一个人需要，你的创意也能在科技助力下真切地改变生活</span>。
                  </p>
                  <div className="text-base text-muted-foreground mb-3">
                    <span className="text-primary font-semibold">奖项设置：</span>一等奖：1名，奖金 100 元；二等奖：2名，奖金 50 元；三等奖：5名，奖金 15 元
                  </div>
                </div>

                {/* 人气奖 */}
                <div
                  className={`border-l-4 border-yellow-500 pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('popular-award')
                    ? 'transform scale-105 opacity-100 blur-none'
                    : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                    }`}
                  data-section="popular-award"
                >
                  <h4 className="text-3xl md:text-4xl font-bold mb-6">
                    <span className="text-yellow-600 dark:text-yellow-400">人气奖</span>
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    在公开展示投票上获得最多投票的队伍将获得人气奖。
                  </p>
                  <div className="text-base text-muted-foreground">
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">奖项设置：</span>人气奖：1名，奖金 50 元
                  </div>
                </div>
                {/* 作品要求 */}
                <div
                  className={`border-l-4 border-yellow-500 pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('popular-award')
                    ? 'transform scale-105 opacity-100 blur-none'
                    : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                    }`}
                  data-section="popular-award"
                >
                  <h4 className="text-3xl md:text-4xl font-bold mb-6">
                    <span className="text-yellow-600 dark:text-yellow-400">人气奖</span>
                  </h4>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    在公开展示投票上获得最多投票的队伍将获得人气奖。
                  </p>
                  <div className="text-base text-muted-foreground">
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">奖项设置：</span>人气奖：1名，奖金 50 元
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 作品提交 */}
          <div className="space-y-12">
            <div
              className={`transition-all duration-1000 bg-card/50 rounded-lg overflow-hidden ${visibleSections.has('submission-title')
                ? 'transform scale-105 opacity-100 blur-none'
                : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                }`}
              data-section="submission-title"
            >
              {/* 可点击的标题区域 */}
              <div
                className="relative p-8 cursor-pointer hover:bg-card/70 transition-all duration-300 group"
                onClick={() => toggleSection('submission')}
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-0 relative inline-block">
                  作品提交
                  {/* 悬停下划线动画 */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
                </h3>
                {/* 展开/折叠提示 + 指示器 */}
                <span className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:inline">
                  {expandedSections.has('submission') ? '点击此处折叠' : '点击此处展开'}
                </span>
                <div className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-transform duration-300 ${expandedSections.has('submission') ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 可折叠的详细提交规则 */}
            <div className={`transition-all duration-500 ease-in-out space-y-12 ${expandedSections.has('submission') ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>

              {/* 提交方式 */}
              <div
                className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('submission-method')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="submission-method"
              >
                <h4 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-primary">作品提交方式</span>
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  每个作品可以在三个主题中选择最多两个进行参加。
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  所有作品需根据要求提交规定内容至飞书。所有作品都需要提供：项目说明文档；三分钟左右的演示视频（视频项目除外）。
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  以上两项内容下文不再赘述。
                </p>
              </div>

              {/* Web 作品 */}
              <div
                className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('web-submission')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="web-submission"
              >
                <h4 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-primary">Web 作品</span>
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  参赛者需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>有效的网站访问链接。</li>
                </ol>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  特别的，对于主题 1 的参赛者，需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>可以直接在浏览器打开的 HTML 文件 / 构建指令；</li>
                  <li>用于证明作品大部分由 AI 完成的会话记录文本文件或截图。</li>
                </ol>
                <p className="text-base text-yellow-600 dark:text-yellow-400 font-medium">
                  请注意，禁止在源码中加入经过混淆、压缩或加密的 JavaScript 代码。如果使用了 Webpack、Vite等构建工具的，你需要提供源代码而非构建产物。
                </p>
              </div>

              {/* 软件作品 */}
              <div
                className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('software-submission')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="software-submission"
              >
                <h4 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-primary">软件作品</span>
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  参赛者需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>软件编译指南和编译脚本。</li>
                </ol>

                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  特别的，对于使用 <span className="text-primary font-semibold">Python</span> 编写的项目，需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>源码根目录下需要存在 requirements.txt，以注明所引用的第三方库；</li>
                  <li>软件运行指南（或根目录下 REDAME.md 文件中包含运行软件的相关指引）；</li>
                  <li>软件运行脚本。</li>
                </ol>

                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  对于使用 <span className="text-primary font-semibold">NodeJS</span> 编写的项目，需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>源码根目录下需要存在 package.json，以注明项目依赖和基本信息；</li>
                  <li>软件运行指南（或根目录下 REDAME.md 文件中包含运行软件的相关指引）；</li>
                  <li>软件运行脚本。</li>
                </ol>

                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  对于使用 <span className="text-primary font-semibold">C++</span> 编写的项目，需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed mb-6 space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>软件运行指南（或根目录下 REDAME.md 文件中包含运行软件的相关指引）；</li>
                  <li>提供编译脚本。</li>
                </ol>

                <p className="text-base text-red-600 dark:text-red-400 font-medium">
                  请注意，禁止在源码中植入计算机病毒相关内容，或尝试对评审用环境造成任何不利影响。
                </p>
              </div>

              {/* 硬件作品 */}
              <div
                className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('hardware-submission')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="hardware-submission"
              >
                <h4 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-primary">硬件作品</span>
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  参赛者需要提供：
                </p>
                <ol className="text-lg text-muted-foreground leading-relaxed space-y-2 list-decimal list-inside">
                  <li>源码压缩包或公开的 Git 仓库链接；</li>
                  <li>项目硬件选型方案和物料清单；</li>
                </ol>
              </div>

              {/* 视频作品 */}
              <div
                className={`border-l-4 border-primary pl-6 bg-card/50 rounded-r-lg p-6 transition-all duration-1000 hover:scale-110 cursor-pointer hover:bg-card/70 ${visibleSections.has('video-submission')
                  ? 'transform scale-105 opacity-100 blur-none'
                  : 'transform scale-90 opacity-0 blur-sm translate-y-8'
                  }`}
                data-section="video-submission"
              >
                <h4 className="text-3xl md:text-4xl font-bold mb-6">
                  <span className="text-primary">视频作品</span>
                </h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  参赛者需要在 BiliBili 平台发布公开视频，并提供视频链接。
                </p>
              </div>
            </div>

            <div className="flex gap-6 justify-center mb-16 flex-wrap">
              <Button
                variant="outline"
                size="lg"
                className="bg-card/50 hover:bg-primary hover:text-primary-foreground transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border-primary/50 hover:border-primary"
              >
                <Link href="https://tcnlbejp56nf.feishu.cn/share/base/form/shrcnWVcXfolsLg6tXZhoeXRXSb" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  立即报名
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-card/50 hover:bg-green-600 hover:text-white transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border-green-500/50 hover:border-green-600"
              >
                <Link href="https://tcnlbejp56nf.feishu.cn/share/base/form/shrcn007JnsSHJXC3i6rnq6Vy4e" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  提交作品
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="bg-card/50 hover:bg-blue-600 hover:text-white transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border-blue-500/50 hover:border-blue-600"
              >
                <Link href="/leaderboard" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  查看排行榜
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">参赛作品</h2>
              <p className="text-muted-foreground">
                共收到 {projects.length} 个优秀作品，展示青少年的创新能力
                {totalPages > 1 && (
                  <span className="ml-2">
                    (第 {currentPage} 页，共 {totalPages} 页)
                  </span>
                )}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedProjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 bg-card/50 hover:bg-primary hover:text-primary-foreground transform hover:scale-110 transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-card/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>

                  <div className="flex gap-1">
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[40px] transform hover:scale-110 transition-all duration-300 ${currentPage === page
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-card/50 hover:bg-primary hover:text-primary-foreground"
                          }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 bg-card/50 hover:bg-primary hover:text-primary-foreground transform hover:scale-110 transition-all duration-300 disabled:hover:scale-100 disabled:hover:bg-card/50"
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
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