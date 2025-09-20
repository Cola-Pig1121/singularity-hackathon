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
    } finally {
      setIsLoading(false)
    }
  }

  const checkVoteStatus = () => {
    // 检查本地存储，判断用户是否已经投过票
    const votedProjects = JSON.parse(localStorage.getItem('voted_projects') || '[]')
    setHasVoted(votedProjects.includes(projectIdBigInt.toString()))
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
      const success = await voteFunctions.incrementVote(projectIdBigInt)
      
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