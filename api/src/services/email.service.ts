import nodemailer from 'nodemailer'
import Handlebars from 'handlebars'
import juice from 'juice'
import { config } from '../config.js'
import { supabaseAdmin } from '../utils/supabase.js'
import { logger } from '../utils/logger.js'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
})

const baseTemplate = Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background-color: #1a56db; padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; }
    .content { padding: 32px 24px; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #1a56db; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .task-row { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .overdue { color: #dc2626; font-weight: 600; }
    .due-soon { color: #f59e0b; }
    h2 { color: #111827; font-size: 18px; margin-top: 24px; }
    p { color: #374151; line-height: 1.6; }
    .stat { display: inline-block; padding: 8px 16px; background: #f3f4f6; border-radius: 8px; margin: 4px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: 700; color: #1a56db; }
    .stat-label { font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Home Maintenance</h1>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>You're receiving this because you have an account on Home Maintenance.</p>
      <p><a href="{{appUrl}}/settings">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
`)

const digestTemplate = Handlebars.compile(`
<h2>Good morning, {{userName}}!</h2>
<p>Here's your maintenance summary for the week:</p>

{{#each homes}}
<h2>{{this.name}}</h2>

{{#if this.overdueTasks.length}}
<p class="overdue">Overdue ({{this.overdueTasks.length}})</p>
{{#each this.overdueTasks}}
<div class="task-row">
  <strong>{{this.title}}</strong><br>
  <small>{{this.equipmentName}} &middot; Due {{this.dueDate}}</small>
</div>
{{/each}}
{{/if}}

{{#if this.upcomingTasks.length}}
<p class="due-soon">Due This Week ({{this.upcomingTasks.length}})</p>
{{#each this.upcomingTasks}}
<div class="task-row">
  <strong>{{this.title}}</strong><br>
  <small>{{this.equipmentName}} &middot; Due {{this.dueDate}}</small>
</div>
{{/each}}
{{/if}}

{{#unless this.overdueTasks.length}}
{{#unless this.upcomingTasks.length}}
<p style="color: #16a34a;">All caught up! No tasks due this week.</p>
{{/unless}}
{{/unless}}
{{/each}}

<div style="text-align: center; margin-top: 32px;">
  <a href="{{appUrl}}/calendar" class="btn">View Calendar</a>
</div>
`)

export async function sendWeeklyDigest(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) return

  // Get user's homes
  const { data: memberships } = await supabaseAdmin
    .from('home_members')
    .select('home_id, homes(name)')
    .eq('user_id', userId)

  if (!memberships || memberships.length === 0) return

  const homeData = []
  for (const m of memberships) {
    const home = (m as any).homes
    const { data: tasks } = await supabaseAdmin
      .from('tasks_with_status')
      .select('*')
      .eq('home_id', m.home_id)
      .eq('is_active', true)
      .in('status', ['overdue', 'due_soon'])

    homeData.push({
      name: home?.name || 'Home',
      overdueTasks: (tasks || [])
        .filter((t: any) => t.status === 'overdue')
        .map((t: any) => ({
          title: t.title,
          equipmentName: t.equipment_name,
          dueDate: t.next_due_date,
        })),
      upcomingTasks: (tasks || [])
        .filter((t: any) => t.status === 'due_soon')
        .map((t: any) => ({
          title: t.title,
          equipmentName: t.equipment_name,
          dueDate: t.next_due_date,
        })),
    })
  }

  const body = digestTemplate({
    userName: profile.full_name || 'Homeowner',
    homes: homeData,
    appUrl: config.appUrl,
  })

  const html = juice(baseTemplate({ body, appUrl: config.appUrl }))

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: profile.email,
      subject: 'Your Weekly Home Maintenance Summary',
      html,
    })

    await supabaseAdmin.from('email_log').insert({
      user_id: userId,
      email_type: 'weekly_digest',
      subject: 'Your Weekly Home Maintenance Summary',
      status: 'sent',
    })

    logger.info('Weekly digest sent', { userId, email: profile.email })
  } catch (error) {
    logger.error('Failed to send digest', { userId, error: (error as Error).message })
    await supabaseAdmin.from('email_log').insert({
      user_id: userId,
      email_type: 'weekly_digest',
      subject: 'Your Weekly Home Maintenance Summary',
      status: 'failed',
      metadata: { error: (error as Error).message } as any,
    })
  }
}

export async function sendInvitationEmail(params: {
  email: string
  homeName: string
  inviterName: string
  token: string
  role: string
}) {
  const body = `
    <h2>You've been invited!</h2>
    <p><strong>${params.inviterName}</strong> has invited you to collaborate on
    <strong>${params.homeName}</strong> as a <strong>${params.role}</strong>.</p>
    <p>Click the button below to accept the invitation:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${config.appUrl}/invitation/${params.token}" class="btn">Accept Invitation</a>
    </div>
    <p style="font-size: 12px; color: #6b7280;">This invitation expires in 7 days.</p>
  `

  const html = juice(baseTemplate({ body, appUrl: config.appUrl }))

  await transporter.sendMail({
    from: config.smtp.from,
    to: params.email,
    subject: `You've been invited to ${params.homeName} on Home Maintenance`,
    html,
  })
}
