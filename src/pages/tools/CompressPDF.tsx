import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";

const CompressPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setCompressedSize(null);
      return;
    }
    setFile(files[0]);
    setCompressedSize(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Save with compression options
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const originalSize = file.size;
      const compressedSize = compressedPdfBytes.length;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;

      setCompressedSize(compressedSize);

      toast({
        title: "PDF Compressed",
        description: `File size reduced by ${reduction.toFixed(1)}%. Downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to compress PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
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
                <h3 className="text-lg font-semibold mb-2">File Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Original Size: </span>
                    <span className="font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </p>
                  {compressedSize && (
                    <p>
                      <span className="text-muted-foreground">Compressed Size: </span>
                      <span className="font-medium text-primary">
                        {(compressedSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCompress}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Compress & Download
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

export default CompressPDF;
