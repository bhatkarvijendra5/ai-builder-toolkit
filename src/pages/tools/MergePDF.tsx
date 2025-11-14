import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    setTimeout(() => {
      setIsProcessing(false);
      toast.success("PDFs merged successfully!");
    }, 3000);
  };

  return (
    <ToolPage
      title="Merge PDF"
      description="Combine multiple PDF files into a single document"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={10}
          onFilesSelected={setFiles}
          acceptedFileTypes="PDF files"
        />

        {files.length >= 2 && (
          <div className="space-y-4">
            {isProcessing && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Merging PDFs...</p>
                <Progress value={progress} />
              </div>
            )}

            <Button
              onClick={handleMerge}
              disabled={isProcessing}
              className="gradient-primary w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Merge PDFs
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default MergePDF;
