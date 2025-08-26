// Achievement Seeder for Nordic Football Betting
// Populates the database with all predefined achievements

import { PrismaClient } from '@prisma/client'
import { ACHIEVEMENTS } from './achievement-system'

const prisma = new PrismaClient()

export async function seedAchievements() {
  console.log('🏆 Starting achievement seeding...')
  
  try {
    // Clear existing achievements if needed (be careful in production)
    // await prisma.achievement.deleteMany({})
    
    let created = 0
    let updated = 0
    let skipped = 0

    for (const achievement of ACHIEVEMENTS) {
      try {
        // Check if achievement already exists
        const existing = await prisma.achievement.findUnique({
          where: { id: achievement.id }
        })

        if (existing) {
          // Update existing achievement to ensure it has latest data
          await prisma.achievement.update({
            where: { id: achievement.id },
            data: {
              name: achievement.name,
              description: achievement.description,
              category: achievement.category,
              tier: achievement.tier,
              requirement: achievement.requirement,
              reward: achievement.reward,
              iconUrl: achievement.iconUrl
            }
          })
          updated++
          console.log(`✅ Updated achievement: ${achievement.name}`)
        } else {
          // Create new achievement
          await prisma.achievement.create({
            data: {
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              category: achievement.category,
              tier: achievement.tier,
              requirement: achievement.requirement,
              reward: achievement.reward,
              iconUrl: achievement.iconUrl
            }
          })
          created++
          console.log(`🆕 Created achievement: ${achievement.name}`)
        }
      } catch (error) {
        console.error(`❌ Error processing achievement ${achievement.id}:`, error)
        skipped++
      }
    }

    console.log('\n🎉 Achievement seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   Created: ${created}`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total: ${ACHIEVEMENTS.length}`)

    // Verify seeding
    const totalAchievements = await prisma.achievement.count()
    console.log(`\n✅ Database now contains ${totalAchievements} achievements`)

    return {
      success: true,
      created,
      updated,
      skipped,
      total: totalAchievements
    }

  } catch (error) {
    console.error('❌ Achievement seeding failed:', error)
    throw error
  }
}

// Function to seed achievements for a specific category
export async function seedAchievementsByCategory(category: string) {
  const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category)
  
  console.log(`🏆 Seeding ${categoryAchievements.length} achievements for category: ${category}`)
  
  for (const achievement of categoryAchievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      create: {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        tier: achievement.tier,
        requirement: achievement.requirement,
        reward: achievement.reward,
        iconUrl: achievement.iconUrl
      },
      update: {
        name: achievement.name,
        description: achievement.description,
        tier: achievement.tier,
        requirement: achievement.requirement,
        reward: achievement.reward,
        iconUrl: achievement.iconUrl
      }
    })
  }
  
  console.log(`✅ Completed seeding for category: ${category}`)
}

// Function to verify achievement integrity
export async function verifyAchievements() {
  console.log('🔍 Verifying achievement integrity...')
  
  const issues: string[] = []
  
  for (const achievement of ACHIEVEMENTS) {
    // Check if achievement exists in database
    const dbAchievement = await prisma.achievement.findUnique({
      where: { id: achievement.id }
    })
    
    if (!dbAchievement) {
      issues.push(`Missing achievement in database: ${achievement.id}`)
      continue
    }
    
    // Check if data matches
    if (dbAchievement.name !== achievement.name) {
      issues.push(`Name mismatch for ${achievement.id}: DB="${dbAchievement.name}" vs Code="${achievement.name}"`)
    }
    
    if (dbAchievement.tier !== achievement.tier) {
      issues.push(`Tier mismatch for ${achievement.id}: DB=${dbAchievement.tier} vs Code=${achievement.tier}`)
    }
    
    // Validate reward structure
    const reward = dbAchievement.reward as any
    if (!reward || typeof reward !== 'object') {
      issues.push(`Invalid reward structure for ${achievement.id}`)
    } else {
      if (typeof reward.betPoints !== 'number' || reward.betPoints < 0) {
        issues.push(`Invalid betPoints reward for ${achievement.id}`)
      }
      if (typeof reward.diamonds !== 'number' || reward.diamonds < 0) {
        issues.push(`Invalid diamonds reward for ${achievement.id}`)
      }
      if (typeof reward.xp !== 'number' || reward.xp < 0) {
        issues.push(`Invalid XP reward for ${achievement.id}`)
      }
    }
    
    // Validate requirement structure
    const requirement = dbAchievement.requirement as any
    if (!requirement || typeof requirement !== 'object') {
      issues.push(`Invalid requirement structure for ${achievement.id}`)
    } else {
      if (!requirement.type || typeof requirement.target !== 'number') {
        issues.push(`Invalid requirement data for ${achievement.id}`)
      }
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ All achievements verified successfully!')
  } else {
    console.log(`❌ Found ${issues.length} issues:`)
    issues.forEach(issue => console.log(`   - ${issue}`))
  }
  
  return issues
}

// Function to get achievement statistics
export async function getAchievementStats() {
  console.log('📊 Gathering achievement statistics...')
  
  const stats = {
    total: await prisma.achievement.count(),
    byCategory: {} as Record<string, number>,
    byTier: {} as Record<number, number>,
    totalRewards: {
      betPoints: 0,
      diamonds: 0,
      xp: 0
    }
  }
  
  // Count by category
  for (const category of ['BETTING', 'WINNING', 'LOYALTY', 'SPECIAL', 'SOCIAL']) {
    stats.byCategory[category] = await prisma.achievement.count({
      where: { category: category as any }
    })
  }
  
  // Count by tier
  for (const tier of [1, 2, 3]) {
    stats.byTier[tier] = await prisma.achievement.count({
      where: { tier }
    })
  }
  
  // Calculate total rewards
  const achievements = await prisma.achievement.findMany({
    select: { reward: true }
  })
  
  achievements.forEach(achievement => {
    const reward = achievement.reward as any
    stats.totalRewards.betPoints += reward.betPoints || 0
    stats.totalRewards.diamonds += reward.diamonds || 0
    stats.totalRewards.xp += reward.xp || 0
  })
  
  console.log('📈 Achievement Statistics:')
  console.log(`   Total Achievements: ${stats.total}`)
  console.log(`   By Category:`)
  Object.entries(stats.byCategory).forEach(([cat, count]) => {
    console.log(`     ${cat}: ${count}`)
  })
  console.log(`   By Tier:`)
  Object.entries(stats.byTier).forEach(([tier, count]) => {
    console.log(`     Tier ${tier}: ${count}`)
  })
  console.log(`   Total Rewards Available:`)
  console.log(`     BetPoints: ${stats.totalRewards.betPoints.toLocaleString()}`)
  console.log(`     Diamonds: ${stats.totalRewards.diamonds}`)
  console.log(`     XP: ${stats.totalRewards.xp.toLocaleString()}`)
  
  return stats
}

// CLI runner function
export async function runAchievementSeeder() {
  try {
    console.log('🚀 Starting achievement management...\n')
    
    // Seed achievements
    await seedAchievements()
    
    console.log('\n')
    
    // Verify achievements
    await verifyAchievements()
    
    console.log('\n')
    
    // Show statistics
    await getAchievementStats()
    
    console.log('\n✨ Achievement management completed successfully!')
    
  } catch (error) {
    console.error('💥 Achievement management failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  runAchievementSeeder()
}