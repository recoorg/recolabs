// server/emailAutomation.ts
// Automated transactional & notification emails for Reco Labs
// Dispatched via noreply@recolabs.in · Powered by Resend

export interface EmailRenderOptions {
  title?: string
  monoTag: string
  headline: string
  leadParagraph?: string
  bodyParagraphs: string[]
  ctaText?: string
  ctaUrl?: string
  footerNote?: string
}

export function renderRecoEmailHtml(options: EmailRenderOptions): string {
  const {
    title = "Reco Labs Guild",
    monoTag,
    headline,
    leadParagraph,
    bodyParagraphs = [],
    ctaText = "Join Reco Labs \u2192",
    ctaUrl = "https://recolabs.in",
    footerNote = "Sent by Reco Labs Guild \u00b7 Built by hackers, for hackers.",
  } = options

  const leadHtml = leadParagraph
    ? `<p style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #09090b; font-weight: 500;">
         ${leadParagraph}
       </p>`
    : ""

  const bodyHtml = bodyParagraphs
    .map(
      (p) =>
        `<p style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #3f3f46;">
           ${p}
         </p>`
    )
    .join("\n")

  const ctaButtonHtml =
    ctaText && ctaUrl
      ? `<!-- Call to Action Button -->
         <tr>
             <td align="left" style="padding: 0 0 60px 0;">
                 <table border="0" cellpadding="0" cellspacing="0">
                     <tr>
                         <td align="center" style="border-radius: 6px; background-color: #09090b;">
                             <a href="${ctaUrl}" target="_blank" style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; display: inline-block; padding: 12px 24px; border: 1px solid #09090b; border-radius: 6px;">
                                 ${ctaText}
                             </a>
                         </td>
                     </tr>
                 </table>
             </td>
         </tr>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <!-- Import Instrument Sans and Geist Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- [if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; }
    </style>
</head>
<body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; padding: 60px 20px;">
        <tr>
            <td align="center">
                <!-- Main Content Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff;">
                    
                    <!-- Header with Small Logo -->
                    <tr>
                        <td align="left" style="padding: 0 0 40px 0;">
                            <img src="https://www.recolabs.in/logo-black.png" alt="Reco Labs" width="48" style="display: block; max-width: 48px; height: auto; border: 0;">
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td align="left" style="padding: 0 0 10px 0;">
                            <!-- Geist Mono Accent -->
                            <p style="font-family: 'Geist Mono', 'Courier New', Courier, monospace; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; margin: 0 0 24px 0; color: #ef4444;">
                                ${escapeHtml(monoTag)}
                            </p>
                            
                            <!-- Instrument Sans Main Typography -->
                            <h1 style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 28px; font-weight: 500; letter-spacing: -0.5px; margin: 0 0 24px 0; color: #09090b; line-height: 1.2;">
                                ${escapeHtml(headline)}
                            </h1>
                            
                            ${leadHtml}
                            ${bodyHtml}
                        </td>
                    </tr>

                    ${ctaButtonHtml}

                    <!-- Footer Section -->
                    <tr>
                        <td align="left" style="border-top: 1px solid #e4e4e7; padding: 32px 0 0 0;">
                            <p style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0; color: #71717a;">
                                ${escapeHtml(footerNote)}
                            </p>
                            <p style="font-family: 'Instrument Sans', -apple-system, sans-serif; font-size: 14px; line-height: 1.5; margin: 0; color: #71717a;">
                                Not interested? No worries, feel free to ignore this or <a href="https://recolabs.in/unsubscribe" style="color: #71717a; text-decoration: underline;">unsubscribe</a>.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  if (!str) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function sendEmailViaResend(data: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || "").trim()
  if (!apiKey) {
    console.warn("[emailAutomation] Skipped sending: RESEND_API_KEY environment variable is not set.")
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.to || !emailRegex.test(data.to.trim())) {
    console.warn("[emailAutomation] Skipped sending: invalid recipient email", data.to)
    return false
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reco Labs <noreply@recolabs.in>",
        to: [data.to.trim()],
        reply_to: data.replyTo || "devadibxr@gmail.com",
        subject: data.subject,
        html: data.html,
        text: data.text || "",
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.warn("[emailAutomation] Resend error response:", res.status, err)
      return false
    }

    const json: any = await res.json()
    console.log("[emailAutomation] Email dispatched successfully:", json.id, "to:", data.to)
    return true
  } catch (err) {
    console.warn("[emailAutomation] Network exception sending email:", err)
    return false
  }
}

// ============================================================================
// AUTOMATION TRIGGERS
// ============================================================================

// 1. WELCOME ON SIGNUP
export async function notifyUserSignup(user: { email: string; name?: string; username: string }) {
  if (!user.email) return
  const username = user.username || "builder"
  const displayName = user.name || `@${username}`

  const html = renderRecoEmailHtml({
    title: "Welcome to Reco Labs",
    monoTag: "// WELCOME TO RECO LABS",
    headline: `Welcome to the Guild, ${displayName}.`,
    leadParagraph: "Your Reco Labs builder account has been initialized.",
    bodyParagraphs: [
      "We are building a space for students, developers, and creators to ship projects, learn new skills, and connect with like-minded peers across schools and colleges.",
      `Your public builder profile is live at <a href="https://recolabs.in/builder/${username}" style="color: #09090b; text-decoration: underline; font-weight: 500;">recolabs.in/builder/${username}</a>. You can showcase what you're building, list open roles, and share engineering knowledge.`,
      `Join our active builders WhatsApp channel at <a href="https://chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5" style="color: #09090b; text-decoration: underline; font-weight: 500;">chat.whatsapp.com/IApnk6YLM0l2j1nwcVzRR5</a> to meet the rest of the guild.`,
    ],
    ctaText: "Visit Your Builder Profile \u2192",
    ctaUrl: `https://recolabs.in/builder/${username}`,
    footerNote: "Sent by Reco Labs Guild \u00b7 Built by hackers, for hackers.",
  })

  // Run in background without awaiting or blocking caller
  sendEmailViaResend({
    to: user.email,
    subject: `Welcome to Reco Labs Guild, @${username}`,
    html,
    text: `Welcome to the Guild, @${username}! Your profile is live at https://recolabs.in/builder/${username}`,
  }).catch((err) => console.warn("[emailAutomation] Signup notification error:", err))
}

// 2. SECURITY ALERT ON LOGIN
export async function notifyUserLogin(user: { email: string; name?: string; username: string }) {
  if (!user.email) return
  const username = user.username || "builder"

  const html = renderRecoEmailHtml({
    title: "Security Notice: Reco Account Login",
    monoTag: "// SECURITY ALERT",
    headline: "New Sign-In Detected.",
    leadParagraph: `We noticed a new login to your Reco Labs builder account (@${username}).`,
    bodyParagraphs: [
      "If this was you, you're all set to ship. You can post new builds, review launches, and collaborate with other builders.",
      "If you did not initiate this sign-in, please reply directly to this email so our security team can assist you immediately.",
    ],
    ctaText: "Open Reco Guild \u2192",
    ctaUrl: "https://recolabs.in/network",
    footerNote: `Security notification for @${username}.`,
  })

  sendEmailViaResend({
    to: user.email,
    subject: `New Sign-In to your Reco Account (@${username})`,
    html,
    text: `Security alert: New sign-in detected for @${username}. If this wasn't you, reply to this email.`,
  }).catch((err) => console.warn("[emailAutomation] Login notification error:", err))
}

// 3. POST PUBLISHED CONFIRMATION
export async function notifyPostPublished(post: {
  founderEmail: string
  founderName?: string
  title: string
  postUrl: string
}) {
  if (!post.founderEmail) return

  const html = renderRecoEmailHtml({
    title: `Project Live: ${post.title}`,
    monoTag: "// POST PUBLISHED",
    headline: "Your build is live on the builder feed.",
    leadParagraph: `"${post.title}" has been successfully published to the Reco Labs platform.`,
    bodyParagraphs: [
      "Other students, engineers, and creators can now discover your work, upvote, test your live link, and leave direct feedback in the comments.",
      "Share your launch link with friends to get your project featured in the trending spotlight.",
    ],
    ctaText: "View Your Post Live \u2192",
    ctaUrl: post.postUrl,
    footerNote: "Published on Reco Labs Network.",
  })

  sendEmailViaResend({
    to: post.founderEmail,
    subject: `Your project "${post.title}" is live on Reco Network`,
    html,
    text: `Your project "${post.title}" is live! Check it out at ${post.postUrl}`,
  }).catch((err) => console.warn("[emailAutomation] Post published notification error:", err))
}

// 4. NEW COMMENT NOTIFICATION
export async function notifyNewComment(comment: {
  postTitle: string
  recipientEmail: string
  recipientUsername?: string
  commenterUsername: string
  commentContent: string
  postUrl: string
}) {
  if (!comment.recipientEmail) return

  const snippet = comment.commentContent.length > 280
    ? comment.commentContent.slice(0, 280) + "..."
    : comment.commentContent

  const html = renderRecoEmailHtml({
    title: `New comment on ${comment.postTitle}`,
    monoTag: "// NEW COMMENT RECEIVED",
    headline: `New comment on "${comment.postTitle}".`,
    leadParagraph: `<strong>@${escapeHtml(comment.commenterUsername)}</strong> just left feedback on your build:`,
    bodyParagraphs: [
      `<span style="display: block; padding: 14px 18px; background-color: #f4f4f5; border-left: 3px solid #09090b; border-radius: 4px; font-style: italic; color: #18181b;">&ldquo;${escapeHtml(snippet)}&rdquo;</span>`,
      "Jump back into the thread to reply, answer questions, and keep your project momentum going.",
    ],
    ctaText: "Reply to Comment \u2192",
    ctaUrl: comment.postUrl,
    footerNote: `Notification for @${comment.recipientUsername || "builder"} on Reco Labs.`,
  })

  sendEmailViaResend({
    to: comment.recipientEmail,
    subject: `@${comment.commenterUsername} commented on "${comment.postTitle}"`,
    html,
    text: `@${comment.commenterUsername} commented on "${comment.postTitle}": "${snippet}". Reply at ${comment.postUrl}`,
  }).catch((err) => console.warn("[emailAutomation] Comment notification error:", err))
}
