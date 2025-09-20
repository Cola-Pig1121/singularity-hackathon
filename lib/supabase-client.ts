// 客户端使用的Supabase配置
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckuskzwbupcgzbkvmddv.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_T1R2S7HFYrAW3e-M0g0dug_N2G_jTVF'

// 创建Supabase客户端
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey)
}

// 投票相关函数（客户端版本）
export const clientVoteFunctions = {
  // 获取项目票数
  async getProjectVotes(projectId: string) {
    const supabase = createSupabaseClient()
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

  // 增加票数
  async incrementVote(projectId: string) {
    const supabase = createSupabaseClient()
    
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

  // 获取所有项目票数排名
  async getVoteRankings() {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('project_votes')
      .select('project_id, votes')
      .order('votes', { ascending: false })

    if (error) {
      console.error('获取排名错误:', error)
      return []
    }

    return data
  }
}