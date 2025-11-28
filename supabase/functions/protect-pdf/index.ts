import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Writing temporary files for encryption");
    const inputPath = `/tmp/input-${Date.now()}.pdf`;
    const outputPath = `/tmp/output-${Date.now()}.pdf`;
    await Deno.writeFile(inputPath, bytes);

    console.log("Attempting PDF encryption with pdftk");
    try {
      // Try using pdftk if available
      const pdftkProcess = new Deno.Command("pdftk", {
        args: [
          inputPath,
          "output",
          outputPath,
          "user_pw",
          password,
          "owner_pw",
          password,
          "encrypt_128bit",
        ],
        stdout: "piped",
        stderr: "piped",
      });

      const { success: pdftkSuccess, stderr: pdftkStderr } = await pdftkProcess.output();

      if (!pdftkSuccess) {
        console.log("pdftk not available, trying qpdf");
        
        // Fallback to qpdf
        const qpdfProcess = new Deno.Command("qpdf", {
          args: [
            "--encrypt",
            password,
            password,
            "256",
            "--",
            inputPath,
            outputPath,
          ],
          stdout: "piped",
          stderr: "piped",
        });

        const { success: qpdfSuccess, stderr: qpdfStderr } = await qpdfProcess.output();

        if (!qpdfSuccess) {
          const errorText = new TextDecoder().decode(qpdfStderr);
          console.error("qpdf error:", errorText);
          throw new Error("PDF encryption tools not available");
        }
      }
    } catch (commandError) {
      console.error("Command execution error:", commandError);
      throw new Error("PDF encryption is currently unavailable. Please try again later.");
    }

    console.log("Reading encrypted PDF");
    const protectedPdfBytes = await Deno.readFile(outputPath);

    console.log("Converting encrypted PDF to base64");
    let outputBinaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < protectedPdfBytes.length; i += chunkSize) {
      const chunk = protectedPdfBytes.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Cleaning up temporary files");
    try {
      await Deno.remove(inputPath);
      await Deno.remove(outputPath);
    } catch (cleanupError) {
      console.warn("Failed to clean up temp files:", cleanupError);
    }

    console.log("Returning password-protected PDF");
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
