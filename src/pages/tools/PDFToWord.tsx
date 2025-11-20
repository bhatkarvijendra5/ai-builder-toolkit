import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun } from "docx";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;

      const paragraphs: Paragraph[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        // Add page header
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Page ${i}`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 240, after: 120 },
          })
        );

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY = null;
        let lineText = "";

        for (const item of textContent.items as any[]) {
          const currentY = (item as any).transform[5];
          
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            if (lineText.trim()) {
              paragraphs.push(
                new Paragraph({
                  children: [new TextRun(lineText.trim())],
                  spacing: { after: 120 },
                })
              );
            }
            lineText = "";
          }
          lineText += item.str + " ";
          lastY = currentY;
        }

        if (lineText.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(lineText.trim())],
              spacing: { after: 120 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", ".docx");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion Complete",
        description: "PDF converted to Word document successfully.",
      });
    } catch (error) {
      console.error("Error converting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="PDF to Word"
      description="Convert PDF documents to editable text format"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {file && (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                <p className="text-sm text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>

              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Convert to Word
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ToolPage>
  );
};

export default PDFToWord;
