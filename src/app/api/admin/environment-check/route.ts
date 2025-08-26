import { NextRequest, NextResponse } from 'next/server'
import { validateEnvironment, checkSecurityConfiguration, createSecurityChecklist } from '@/lib/security/environment'

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization')
    const password = request.headers.get('x-admin-password')
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    // Perform comprehensive environment validation
    const environmentData = validateEnvironment()
    const securityChecks = checkSecurityConfiguration()
    const securityChecklist = createSecurityChecklist()

    // Count validation results
    const totalItems = securityChecklist.items.reduce((acc, category) => acc + category.items.length, 0)
    const completedItems = securityChecklist.items.reduce(
      (acc, category) => acc + category.items.filter(item => item.completed).length, 
      0
    )
    const requiredItems = securityChecklist.items.reduce(
      (acc, category) => acc + category.items.filter(item => item.required).length, 
      0
    )
    const completedRequired = securityChecklist.items.reduce(
      (acc, category) => acc + category.items.filter(item => item.required && item.completed).length, 
      0
    )

    const errors = securityChecks.filter(check => check.type === 'error')
    const warnings = securityChecks.filter(check => check.type === 'warning')

    // Determine overall status
    let status = 'ready'
    if (errors.length > 0) {
      status = 'error'
    } else if (completedRequired < requiredItems) {
      status = 'incomplete'
    } else if (warnings.length > 0) {
      status = 'warning'
    }

    const response = {
      status,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: totalItems,
        completed: completedItems,
        completionRate: Math.round((completedItems / totalItems) * 100),
        requiredChecks: requiredItems,
        requiredCompleted: completedRequired,
        requiredCompletionRate: Math.round((completedRequired / requiredItems) * 100),
        errors: errors.length,
        warnings: warnings.length
      },
      validation: {
        environment: environmentData,
        securityChecks: securityChecks,
        checklist: securityChecklist
      },
      recommendations: [
        ...errors.map(e => ({ type: 'error', message: e.message, action: e.recommendation })),
        ...warnings.map(w => ({ type: 'warning', message: w.message, action: w.recommendation }))
      ],
      nextSteps: getNextSteps(status, errors, warnings)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Environment validation error:', error)
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Environment validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function getNextSteps(status: string, errors: any[], warnings: any[]): string[] {
  const steps: string[] = []

  if (status === 'error') {
    steps.push('🚨 Fix all critical errors before deployment')
    steps.push('🔧 Re-run environment validation after fixes')
    if (errors.length > 0) {
      steps.push(`⚠️ Address ${errors.length} error(s) identified`)
    }
  } else if (status === 'incomplete') {
    steps.push('📋 Complete all required environment variables')
    steps.push('🔑 Generate missing secrets using npm run generate-secrets')
    steps.push('🔄 Re-validate environment configuration')
  } else if (status === 'warning') {
    steps.push('✅ Environment is ready for deployment')
    if (warnings.length > 0) {
      steps.push(`⚠️ Consider addressing ${warnings.length} warning(s)`)
    }
    steps.push('🚀 Proceed with deployment process')
  } else {
    steps.push('🎉 Environment validation passed!')
    steps.push('🚀 Ready for production deployment')
    steps.push('📊 Monitor application after deployment')
  }

  steps.push('📚 Check DEPLOYMENT_GUIDE.md for detailed instructions')
  
  return steps
}

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication
    const password = request.headers.get('x-admin-password')
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { action } = await request.json()

    if (action === 'generate-secrets') {
      // Import encryption utilities
      const { generateJWTSecret, generateSecureToken } = await import('@/lib/security/encryption')
      
      const newSecrets = {
        NEXTAUTH_SECRET: generateJWTSecret(),
        ENCRYPTION_KEY: generateSecureToken(32), // 32 bytes = 64 hex chars
        ADMIN_SECRET_KEY: generateJWTSecret(),
        timestamp: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        message: 'New secrets generated successfully',
        secrets: newSecrets,
        warning: 'Update your deployment environment with these new values and restart the application'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Environment action error:', error)
    
    return NextResponse.json(
      { 
        error: 'Action failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}