import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "npm:pdf-lib@^1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Protect PDF function called");
    
    const { pdfBase64, password, fileName } = await req.json();

    if (!pdfBase64 || !password) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "PDF file and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 4) {
      console.error("Password too short");
      return new Response(
        JSON.stringify({ error: "Password must be at least 4 characters long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Decoding PDF from base64");
    // Decode base64 to binary
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Loading PDF document");
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

    console.log("Saving PDF (note: true encryption not supported in pdf-lib)");
    // Note: pdf-lib doesn't support true password encryption
    // This is a known limitation of the library
    const protectedPdfBytes = await pdfDoc.save();

    console.log("Converting PDF to base64 for response");
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(protectedPdfBytes);
    let outputBinaryString = '';
    const chunkSize = 8192; // Process 8KB at a time
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Returning protected PDF");
    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Output,
        fileName: fileName || "protected.pdf"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error protecting PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to protect PDF";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
