// 简单的投票功能测试脚本
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ckuskzwbupcgzbkvmddv.supabase.co'
const supabaseKey = 'sb_publishable_T1R2S7HFYrAW3e-M0g0dug_N2G_jTVF'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVoteFunctions() {
  console.log('测试投票功能...')
  
  try {
    // 测试获取票数
    console.log('1. 测试获取项目票数...')
    const testProjectId = 'test-project-1'
    
    const { data: votesData, error: votesError } = await supabase
      .from('project_votes')
      .select('votes')
      .eq('project_id', testProjectId)
      .single()

    if (votesError && votesError.code !== 'PGRST116') {
      console.error('获取票数错误:', votesError)
    } else {
      console.log('当前票数:', votesData?.votes || 0)
    }

    // 测试增加票数
    console.log('2. 测试增加票数...')
    const { data: existing } = await supabase
      .from('project_votes')
      .select('votes')
      .eq('project_id', testProjectId)
      .single()

    if (existing) {
      const { error: updateError } = await supabase
        .from('project_votes')
        .update({ votes: (existing.votes || 0) + 1 })
        .eq('project_id', testProjectId)
      
      if (updateError) {
        console.error('更新票数错误:', updateError)
      } else {
        console.log('票数增加成功!')
      }
    } else {
      const { error: insertError } = await supabase
        .from('project_votes')
        .insert({ project_id: testProjectId, votes: 1 })
      
      if (insertError) {
        console.error('创建记录错误:', insertError)
      } else {
        console.log('新记录创建成功!')
      }
    }

    // 测试获取排行榜
    console.log('3. 测试获取排行榜...')
    const { data: rankings, error: rankingsError } = await supabase
      .from('project_votes')
      .select('project_id, votes')
      .order('votes', { ascending: false })

    if (rankingsError) {
      console.error('获取排行榜错误:', rankingsError)
    } else {
      console.log('排行榜数据:', rankings)
    }

    console.log('测试完成!')

  } catch (error) {
    console.error('测试过程中出错:', error)
  }
}

testVoteFunctions().catch(console.error)