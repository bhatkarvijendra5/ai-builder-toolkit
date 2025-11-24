import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, GripVertical, X, Trash2, FileStack } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PageData {
  id: string;
  fileIndex: number;
  fileName: string;
  pageNumber: number;
  thumbnail: string;
  totalPages: number;
}

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      await extractAllPages(selectedFiles);
    } else {
      setPages([]);
    }
  };

  const extractAllPages = async (selectedFiles: File[]) => {
    setIsLoadingPages(true);
    const allPages: PageData[] = [];

    try {
      for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
        const file = selectedFiles[fileIndex];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true 
        }).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.8 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any).promise;

          const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
          
          allPages.push({
            id: `${fileIndex}-${pageNum}-${Date.now()}-${Math.random()}`,
            fileIndex,
            fileName: file.name,
            pageNumber: pageNum,
            thumbnail,
            totalPages: pdf.numPages,
          });
        }
      }

      setPages(allPages);
      toast.success(`Loaded ${allPages.length} pages from ${selectedFiles.length} PDF(s)`);
    } catch (error) {
      console.error("Error extracting pages:", error);
      toast.error("Failed to extract pages from PDFs");
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handlePageDragStart = (pageId: string) => {
    setDraggedPageId(pageId);
  };

  const handlePageDragOver = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (!draggedPageId || draggedPageId === targetPageId) return;

    const draggedIndex = pages.findIndex(p => p.id === draggedPageId);
    const targetIndex = pages.findIndex(p => p.id === targetPageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, draggedPage);

    setPages(newPages);
  };

  const handlePageDragEnd = () => {
    setDraggedPageId(null);
  };

  const removePage = (pageId: string) => {
    setPages(pages.filter(p => p.id !== pageId));
    toast.success("Page removed");
  };

  const clearAllPages = () => {
    setPages([]);
    setFiles([]);
    toast.success("All pages cleared");
  };

  const handleMerge = async () => {
    if (pages.length === 0) {
      toast.error("Please add PDF files and pages to merge");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      
      let processedPages = 0;
      
      // Process pages in the order they appear in the pages array
      for (const page of pages) {
        const file = files[page.fileIndex];
        const arrayBuffer = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(arrayBuffer);
        
        // Copy the specific page (pageNumber is 1-indexed, but copyPages uses 0-indexed)
        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.pageNumber - 1]);
        mergedPdf.addPage(copiedPage);
        
        processedPages++;
        setProgress(Math.round((processedPages / pages.length) * 90));
      }
      
      setProgress(95);
      
      const mergedPdfBytes = await mergedPdf.save();
      
      setProgress(100);
      
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merged-pdf-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsProcessing(false);
      toast.success(`${pages.length} pages merged successfully!`);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setIsProcessing(false);
      setProgress(0);
      toast.error("Failed to merge PDFs. Please ensure all files are valid PDFs.");
    }
  };

  return (
    <ToolPage
      title="Merge PDF"
      description="Combine and reorder pages from multiple PDFs with drag-and-drop"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          acceptedFileTypes="PDF files (up to 20)"
        />

        {isLoadingPages && (
          <Card className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Extracting pages and generating thumbnails...
              </p>
            </div>
          </Card>
        )}

        {pages.length > 0 && !isLoadingPages && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileStack className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Pages ({pages.length})
                  </h3>
                </div>
                <Button
                  onClick={clearAllPages}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Drag pages to reorder them. Click X to remove individual pages.
              </p>
              
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      draggable
                      onDragStart={() => handlePageDragStart(page.id)}
                      onDragOver={(e) => handlePageDragOver(e, page.id)}
                      onDragEnd={handlePageDragEnd}
                      className={`group relative rounded-lg border-2 transition-all cursor-move ${
                        draggedPageId === page.id
                          ? "border-primary bg-primary/5 scale-105 shadow-lg"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-muted">
                        <img
                          src={page.thumbnail}
                          alt={`${page.fileName} - Page ${page.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePage(page.id);
                            }}
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 flex items-center justify-center h-7 w-7 rounded-full bg-background/90 border border-border">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium truncate" title={page.fileName}>
                          {page.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Page {page.pageNumber} of {page.totalPages}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="p-6">
              <Button
                onClick={handleMerge}
                disabled={isProcessing || pages.length === 0}
                size="lg"
                className="w-full gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Merging Pages...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Merge {pages.length} Page{pages.length !== 1 ? 's' : ''} into PDF
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 90
                      ? `Processing pages... ${progress}%`
                      : progress < 95
                      ? "Finalizing PDF..."
                      : "Almost done..."}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {files.length > 0 && pages.length === 0 && !isLoadingPages && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              No pages extracted. Please try uploading valid PDF files.
            </p>
          </Card>
        )}
      </div>
    </ToolPage>
  );
};

export default MergePDF;
