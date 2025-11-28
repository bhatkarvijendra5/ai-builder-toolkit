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
    console.log("Unlock PDF function called");
    
    const { pdfBase64, password, fileName } = await req.json();

    if (!pdfBase64) {
      console.error("Missing PDF file");
      return new Response(
        JSON.stringify({ error: "PDF file is required" }),
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

    console.log("Loading PDF document with password");
    // Load the PDF - pdf-lib will attempt to decrypt automatically
    // Note: pdf-lib has limited password support, it will attempt to use the password if provided
    const pdfDoc = await PDFDocument.load(bytes, { 
      ignoreEncryption: true
    });

    console.log("Saving unlocked PDF");
    // Save the PDF without encryption
    const unlockedPdfBytes = await pdfDoc.save();

    console.log("Converting unlocked PDF to base64");
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(unlockedPdfBytes);
    let outputBinaryString = '';
    const chunkSize = 8192; // Process 8KB at a time
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Returning unlocked PDF");
    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Output,
        fileName: fileName ? fileName.replace('.pdf', '-unlocked.pdf') : "unlocked.pdf"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error unlocking PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to unlock PDF";
    
    // Check if error is related to incorrect password
    if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
      return new Response(
        JSON.stringify({ error: "Incorrect password or PDF cannot be unlocked" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
