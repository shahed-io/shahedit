import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

// Renders all registered templates with their previewData.
// Gated by LOVABLE_API_KEY — only the Go API calls this.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Verify the caller is authorized with LOVABLE_API_KEY
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (token !== apiKey) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const templateNames = Object.keys(TEMPLATES)

  // Render all templates in PARALLEL (was serial — caused 5+ sec loads)
  const results = await Promise.all(
    templateNames.map(async (name) => {
      const entry = TEMPLATES[name]
      const displayName = entry.displayName || name

      if (!entry.previewData) {
        return {
          templateName: name,
          displayName,
          subject: '',
          html: '',
          status: 'preview_data_required' as const,
        }
      }

      try {
        const html = await renderAsync(
          React.createElement(entry.component, entry.previewData)
        )
        const resolvedSubject =
          typeof entry.subject === 'function'
            ? entry.subject(entry.previewData)
            : entry.subject

        return {
          templateName: name,
          displayName,
          subject: resolvedSubject,
          html,
          status: 'ready' as const,
        }
      } catch (err) {
        console.error('Failed to render template for preview', {
          template: name,
          error: err,
        })
        return {
          templateName: name,
          displayName,
          subject: '',
          html: '',
          status: 'render_failed' as const,
          errorMessage: err instanceof Error ? err.message : String(err),
        }
      }
    })
  )

  return new Response(JSON.stringify({ templates: results }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
