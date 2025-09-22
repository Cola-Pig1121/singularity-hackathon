'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { voteFunctions } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'

interface VoteButtonProps {
  projectId: string
  className?: string
}

export function VoteButton({ projectId, className }: VoteButtonProps) {
  let projectIdBigInt: bigint
  try {
    projectIdBigInt = BigInt(projectId)
  } catch (error) {
    console.error('无效的项目ID:', projectId, error)
    return (
      <Button variant="outline" className={className} disabled>
        无效项目
      </Button>
    )
  }
  const [votes, setVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadVotes()
    checkVoteStatus()
  }, [projectIdBigInt])

  const loadVotes = async () => {
    try {
      const voteCount = await voteFunctions.getProjectVotes(projectIdBigInt)
      setVotes(voteCount)
    } catch (error) {
      console.error('加载票数失败:', error)
    }
  }

  const checkVoteStatus = async () => {
    try {
      // 首先检查本地存储
      const votedProjects = JSON.parse(localStorage.getItem('voted_projects') || '[]')
      const hasLocalVoted = votedProjects.includes(projectIdBigInt.toString())
      
      if (hasLocalVoted) {
        setHasVoted(true)
        setIsLoading(false)
        return
      }

      // 如果本地存储没有记录，检查IP是否已经投过票
      const userIP = await getUserIP()
      const hasIPVoted = await voteFunctions.checkIPVoted(projectIdBigInt, userIP)
      
      if (hasIPVoted) {
        // 如果IP已经投过票，同步到本地存储
        votedProjects.push(projectIdBigInt.toString())
        localStorage.setItem('voted_projects', JSON.stringify(votedProjects))
        setHasVoted(true)
      } else {
        setHasVoted(false)
      }
    } catch (error) {
      console.error('检查投票状态失败:', error)
      // 如果检查失败，只依赖本地存储
      const votedProjects = JSON.parse(localStorage.getItem('voted_projects') || '[]')
      setHasVoted(votedProjects.includes(projectIdBigInt.toString()))
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户IP地址的函数
  const getUserIP = async (): Promise<string> => {
    try {
      // 尝试使用多个IP获取服务
      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.ip.sb/jsonip'
      ]
      
      for (const service of ipServices) {
        try {
          const response = await fetch(service)
          const data = await response.json()
          const ip = data.ip || data.query
          if (ip) return ip
        } catch (error) {
          console.log(`IP服务 ${service} 失败:`, error)
          continue
        }
      }
      
      // 如果所有服务都失败，返回默认值
      return 'unknown'
    } catch (error) {
      console.error('获取IP失败:', error)
      return 'unknown'
    }
  }

  const handleVote = async () => {
    if (hasVoted) {
      toast({
        title: '投票提示',
        description: '您已经投过票了，每个项目只能投一次哦！',
        variant: 'destructive'
      })
      return
    }

    setIsVoting(true)
    try {
      // 获取用户IP
      const userIP = await getUserIP()
      
      // 检查IP是否已经投过票
      const hasIPVoted = await voteFunctions.checkIPVoted(projectIdBigInt, userIP)
      
      if (hasIPVoted) {
        toast({
          title: '投票失败',
          description: '该IP地址已经投过票了',
          variant: 'destructive'
        })
        // 同步本地状态
        const votedProjects = JSON.parse(localStorage.getItem('voted_projects') || '[]')
        if (!votedProjects.includes(projectIdBigInt.toString())) {
          votedProjects.push(projectIdBigInt.toString())
          localStorage.setItem('voted_projects', JSON.stringify(votedProjects))
        }
        setHasVoted(true)
        return
      }

      // 进行投票并保存IP
      const success = await voteFunctions.incrementVoteWithIP(projectIdBigInt, userIP)
      
      if (success) {
        // 更新本地存储
        const votedProjects = JSON.parse(localStorage.getItem('voted_projects') || '[]')
        votedProjects.push(projectIdBigInt.toString())
        localStorage.setItem('voted_projects', JSON.stringify(votedProjects))
        
        setVotes(votes + 1)
        setHasVoted(true)
        
        toast({
          title: '投票成功',
          description: '感谢您的支持！',
          variant: 'default'
        })
      } else {
        throw new Error('投票失败')
      }
    } catch (error) {
      console.error('投票错误:', error)
      toast({
        title: '投票失败',
        description: '请稍后再试',
        variant: 'destructive'
      })
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        加载中...
      </Button>
    )
  }

  return (
    <Button
      variant={hasVoted ? "secondary" : "default"}
      className={className}
      onClick={handleVote}
      disabled={isVoting || hasVoted}
    >
      {isVoting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 mr-2 ${hasVoted ? 'fill-red-500 text-red-500' : ''}`} />
      )}
      {hasVoted ? '已投票' : '投票支持'}
      <span className="ml-2 bg-primary/10 px-2 py-1 rounded text-sm">
        {votes}
      </span>
    </Button>
  )
}