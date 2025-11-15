import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, GripVertical, X, FileText, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanBeforeMerge, setScanBeforeMerge] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    
    setFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    if (scanBeforeMerge) {
      toast.info("Scanning PDFs before merging...");
    }

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
      toast.success(`${files.length} PDFs merged successfully!`);
    }, 3000);
  };

  return (
    <ToolPage
      title="Merge PDF"
      description="Combine up to 20 PDF files into a single document"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={20}
          onFilesSelected={setFiles}
          acceptedFileTypes="PDF files (up to 20)"
        />

        {files.length > 0 && (
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Selected Files ({files.length}/20)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag files to reorder them before merging
              </p>
              
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-move ${
                      draggedIndex === index
                        ? "border-primary bg-primary/5 scale-105"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {files.length >= 2 && (
              <div className="space-y-4">
                <Card className="glass-card p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="scan-pdfs"
                      checked={scanBeforeMerge}
                      onCheckedChange={(checked) => setScanBeforeMerge(checked as boolean)}
                    />
                    <Label
                      htmlFor="scan-pdfs"
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                    >
                      <ScanLine className="h-4 w-4 text-primary" />
                      Scan PDFs before merging (optional)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-8">
                    Optimize and clean PDFs during the merge process
                  </p>
                </Card>

                {isProcessing && (
                  <Card className="glass-card p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {scanBeforeMerge ? "Scanning and merging PDFs..." : "Merging PDFs..."}
                        </p>
                        <span className="text-sm font-semibold text-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </Card>
                )}

                <Button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="gradient-primary w-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Processing {files.length} PDFs...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-6 w-6" />
                      Merge {files.length} PDFs into One
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default MergePDF;
