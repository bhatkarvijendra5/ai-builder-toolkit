import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileImage, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PagePreview {
  pageNumber: number;
  thumbnail: string;
  selected: boolean;
}

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      setPages([]);
      return;
    }

    const selectedFile = files[0];
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;
      const totalPages = pdf.numPages;

      const pagePreviewsPromises: Promise<PagePreview>[] = [];

      for (let i = 1; i <= totalPages; i++) {
        pagePreviewsPromises.push(
          (async () => {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error("Failed to get canvas context");
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            } as any).promise;

            return {
              pageNumber: i,
              thumbnail: canvas.toDataURL("image/jpeg", 0.7),
              selected: true,
            };
          })()
        );
      }

      const pagePreviewsData = await Promise.all(pagePreviewsPromises);
      setPages(pagePreviewsData);

      toast({
        title: "PDF Loaded",
        description: `Found ${totalPages} page${totalPages > 1 ? "s" : ""} in the PDF.`,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
      setFile(null);
      setPages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page
      )
    );
  };

  const selectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const downloadAsJPEG = async () => {
    if (!file || pages.length === 0) return;

    const selectedPages = pages.filter((page) => page.selected);
    if (selectedPages.length === 0) {
      toast({
        title: "No Pages Selected",
        description: "Please select at least one page to download.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
      }).promise;

      // Process pages sequentially to avoid overwhelming the browser
      for (const pageData of selectedPages) {
        const page = await pdf.getPage(pageData.pageNumber);
        const viewport = page.getViewport({ scale: 2.5 }); // Higher scale for better quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        if (!context) {
          throw new Error("Failed to get canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Fill with white background for better JPEG compatibility
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise;

        // Convert canvas to blob with proper JPEG encoding
        await new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create download link with proper MIME type
                const url = URL.createObjectURL(new Blob([blob], { type: 'image/jpeg' }));
                const a = document.createElement("a");
                a.href = url;
                a.download = `pdftools-split-pdf-page-${pageData.pageNumber}.jpg`;
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                
                // Clean up with slight delay to ensure download starts
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  resolve();
                }, 100);
              } else {
                resolve();
              }
            },
            "image/jpeg",
            0.92
          );
        });

        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${selectedPages.length} JPEG file${
          selectedPages.length > 1 ? "s" : ""
        }. Check your downloads folder.`,
      });
    } catch (error) {
      console.error("Error converting pages:", error);
      toast({
        title: "Error",
        description: "Failed to convert pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <ToolPage
      title="Split PDF to JPEG"
      description="Extract PDF pages and convert them to high-quality JPEG images"
      keywords="split PDF, PDF to JPG, PDF to JPEG, extract PDF pages, convert PDF pages"
      canonicalUrl="https://toolhub.com/tools/split-pdf"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          acceptedFileTypes="PDF"
        />

        {isProcessing && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing PDF pages...
              </p>
            </div>
          </Card>
        )}

        {!isProcessing && pages.length > 0 && (
          <>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    Select Pages to Extract
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} of {pages.length} page
                    {pages.length > 1 ? "s" : ""} selected
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllPages}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllPages}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      page.selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => togglePageSelection(page.pageNumber)}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={page.thumbnail}
                        alt={`Page ${page.pageNumber}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <FileImage className="h-8 w-8 text-primary" />
                    </div>
                    <div className="bg-card p-2 text-center">
                      <p className="text-xs font-medium">
                        Page {page.pageNumber}
                      </p>
                    </div>
                    {page.selected && (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={downloadAsJPEG}
                disabled={selectedCount === 0 || isConverting}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download {selectedCount} Page
                    {selectedCount !== 1 ? "s" : ""} as JPEG
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  );
};

export default SplitPDF;
