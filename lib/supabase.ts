import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// 投票相关函数
export const voteFunctions = {
  // 获取项目票数
  async getProjectVotes(projectId: number | bigint) {
    const { data, error } = await supabase
      .from('project_votes')
      .select('votes')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('获取票数错误:', error)
      return 0
    }
    
    return data?.votes || 0
  },

  // 增加票数（保留原有方法用于兼容）
  async incrementVote(projectId: number | bigint) {
    // 先检查是否存在记录
    const { data: existing } = await supabase
      .from('project_votes')
      .select('votes')
      .eq('project_id', projectId)
      .single()

    if (existing) {
      // 更新现有记录
      const { error } = await supabase
        .from('project_votes')
        .update({ votes: existing.votes + 1 })
        .eq('project_id', projectId)
      
      if (error) {
        console.error('更新票数错误:', error)
        return false
      }
    } else {
      // 创建新记录
      const { error } = await supabase
        .from('project_votes')
        .insert({ project_id: projectId, votes: 1 })
      
      if (error) {
        console.error('创建票数记录错误:', error)
        return false
      }
    }
    
    return true
  },

  // 检查IP是否已经投过票
  async checkIPVoted(projectId: number | bigint, ip: string) {
    const { data, error } = await supabase
      .from('project_votes')
      .select('ip')
      .eq('project_id', projectId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('检查IP投票状态错误:', error)
      return false
    }

    if (!data || !data.ip) {
      return false
    }

    // 检查IP是否在数组中
    return data.ip.includes(ip)
  },

  // 增加票数并保存IP
  async incrementVoteWithIP(projectId: number | bigint, ip: string) {
    // 先检查是否存在记录
    const { data: existing } = await supabase
      .from('project_votes')
      .select('votes, ip')
      .eq('project_id', projectId)
      .single()

    if (existing) {
      // 检查IP是否已经投过票
      if (existing.ip && existing.ip.includes(ip)) {
        console.log('IP已经投过票:', ip)
        return false
      }

      // 更新现有记录，增加票数并添加IP
      const updatedIPs = existing.ip ? [...existing.ip, ip] : [ip]
      const { error } = await supabase
        .from('project_votes')
        .update({ 
          votes: existing.votes + 1,
          ip: updatedIPs
        })
        .eq('project_id', projectId)
      
      if (error) {
        console.error('更新票数和IP错误:', error)
        return false
      }
    } else {
      // 创建新记录
      const { error } = await supabase
        .from('project_votes')
        .insert({ 
          project_id: projectId, 
          votes: 1,
          ip: [ip]
        })
      
      if (error) {
        console.error('创建票数记录错误:', error)
        return false
      }
    }
    
    return true
  },

  // 获取所有项目票数排名（带项目信息）
  async getVoteRankings() {
    const { data, error } = await supabase
      .from('project_votes')
      .select(`
        project_id,
        votes,
        project:project_id (
          id,
          title,
          teamName,
          theme
        )
      `)
      .order('votes', { ascending: false })

    if (error) {
      console.error('获取排名错误:', error)
      return []
    }

    return data
  }
}