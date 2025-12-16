import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, degrees, rgb } from "npm:pdf-lib@^1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlacedSignature {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  page: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sign PDF function called");
    
    const { pdfBase64, signatures, fileName } = await req.json();

    if (!pdfBase64) {
      console.error("Missing PDF file");
      return new Response(
        JSON.stringify({ error: "PDF file is required", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signatures || !Array.isArray(signatures) || signatures.length === 0) {
      console.error("No signatures provided");
      return new Response(
        JSON.stringify({ error: "At least one signature is required", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${signatures.length} signatures`);

    // Decode base64 to binary
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Loading PDF document");
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    // Embed each signature onto the PDF
    for (const sig of signatures as PlacedSignature[]) {
      const page = pages[sig.page];
      if (!page) {
        console.warn(`Page ${sig.page} not found, skipping signature`);
        continue;
      }

      try {
        // Extract image data from data URL
        const base64Data = sig.dataUrl.split(',')[1];
        if (!base64Data) {
          console.error("Invalid signature data URL format");
          continue;
        }

        const signatureBinaryString = atob(base64Data);
        const signatureBytes = new Uint8Array(signatureBinaryString.length);
        for (let i = 0; i < signatureBinaryString.length; i++) {
          signatureBytes[i] = signatureBinaryString.charCodeAt(i);
        }

        // Detect image format and embed accordingly
        const isPng = sig.dataUrl.startsWith('data:image/png');
        let signatureImage;
        
        try {
          signatureImage = isPng 
            ? await pdfDoc.embedPng(signatureBytes)
            : await pdfDoc.embedJpg(signatureBytes);
        } catch (embedError) {
          console.error("Failed to embed signature image:", embedError);
          // Try the other format as fallback
          try {
            signatureImage = isPng 
              ? await pdfDoc.embedJpg(signatureBytes)
              : await pdfDoc.embedPng(signatureBytes);
          } catch (fallbackError) {
            console.error("Failed to embed signature with fallback format:", fallbackError);
            continue;
          }
        }

        const { height: pageHeight } = page.getSize();

        // Draw the signature image on the page
        page.drawImage(signatureImage, {
          x: sig.x,
          y: pageHeight - sig.y - sig.height,
          width: sig.width,
          height: sig.height,
          rotate: degrees(-sig.rotation),
        });

        console.log(`Signature embedded on page ${sig.page + 1}`);
      } catch (sigError) {
        console.error(`Error processing signature on page ${sig.page}:`, sigError);
        throw new Error(`Failed to embed signature on page ${sig.page + 1}`);
      }
    }

    // Add signature metadata to mark document as signed
    pdfDoc.setTitle(pdfDoc.getTitle() || 'Signed Document');
    pdfDoc.setSubject('Digitally Signed Document');
    pdfDoc.setKeywords(['signed', 'digital signature']);
    pdfDoc.setModificationDate(new Date());
    
    // Add custom metadata for signature tracking
    pdfDoc.setCreator('PDF Sign Tool');
    pdfDoc.setProducer(`Signed with ${signatures.length} signature(s) on ${new Date().toISOString()}`);

    console.log("Saving signed PDF");
    // Save the PDF with signatures flattened
    const signedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    console.log("Converting PDF to base64 for response");
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(signedPdfBytes);
    let outputBinaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      outputBinaryString += String.fromCharCode(...chunk);
    }
    
    const base64Output = btoa(outputBinaryString);

    console.log("Successfully signed PDF");
    return new Response(
      JSON.stringify({ 
        pdfBase64: base64Output,
        fileName: fileName || "signed.pdf",
        success: true,
        signatureCount: signatures.length,
        signedAt: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error signing PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sign PDF";
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
