import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, outputFormat } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing document with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert multilingual OCR system specialized in accurately transcribing handwritten and printed text from images in ANY language. Your primary focus is on handwritten text recognition. Detect and preserve the original language(s) in the document - whether it is English, Hindi, Arabic, Chinese, or any other language, including mixed-language content. Extract all text with high precision in the EXACT language(s) it appears in the image, maintaining the original formatting, structure, layout, spacing, and line breaks EXACTLY as they appear in the source. Preserve indentation, bullet points, numbering, and any visual hierarchy. For tables, preserve the tabular structure with proper alignment. Be extremely accurate with spelling, punctuation, and language-specific characters. You must respond in JSON format.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this image and extract all text accurately, with special attention to handwritten text. ${outputFormat === 'excel' ? 'If there are tables or structured data, format them clearly with proper rows and columns.' : 'Maintain the EXACT original formatting, structure, spacing, indentation, line breaks, and layout as they appear in the source document. Preserve any visual hierarchy, bullet points, numbering, or special formatting.'} Respond in JSON format with two fields: "text" containing the extracted text with preserved formatting, and "languages" containing an array of detected language names (e.g., ["English"], ["Hindi"], ["English", "Hindi"]).`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log('Document analysis completed successfully');
    console.log('Detected languages:', result.languages);

    return new Response(JSON.stringify({ 
      text: result.text,
      languages: result.languages 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-document function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
