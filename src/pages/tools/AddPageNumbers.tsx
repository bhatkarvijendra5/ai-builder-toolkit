import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Loader2 } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "sonner";

type VerticalPosition = "top" | "bottom";
type HorizontalPosition = "left" | "center" | "right";
type FontStyle = "normal" | "bold" | "italic";

const AddPageNumbers = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verticalPosition, setVerticalPosition] = useState<VerticalPosition>("bottom");
  const [horizontalPosition, setHorizontalPosition] = useState<HorizontalPosition>("center");
  const [fontSize, setFontSize] = useState([12]);
  const [fontStyle, setFontStyle] = useState<FontStyle>("normal");

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0 && files[0].type === "application/pdf") {
      setFile(files[0]);
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const addPageNumbers = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Select font based on style
      let font;
      switch (fontStyle) {
        case "bold":
          font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          break;
        case "italic":
          font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
          break;
        default:
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = `${index + 1}`;
        const textWidth = font.widthOfTextAtSize(pageNumber, fontSize[0]);
        const margin = 30;

        // Calculate horizontal position
        let x: number;
        switch (horizontalPosition) {
          case "left":
            x = margin;
            break;
          case "right":
            x = width - textWidth - margin;
            break;
          case "center":
          default:
            x = (width - textWidth) / 2;
        }

        // Calculate vertical position
        const y = verticalPosition === "top" ? height - margin : margin;

        page.drawText(pageNumber, {
          x,
          y,
          size: fontSize[0],
          font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".pdf", "_numbered.pdf");
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Page numbers added successfully!");
    } catch (error) {
      console.error("Error adding page numbers:", error);
      toast.error("Failed to add page numbers to PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Add Page Numbers"
      description="Upload a PDF and add page numbers with customizable position and style"
    >
      <div className="space-y-6">
        <FileUploader
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
        />

        {file && (
          <div className="space-y-6 rounded-lg border border-border bg-card p-6">
            <div className="space-y-2">
              <Label>Vertical Position</Label>
              <Select value={verticalPosition} onValueChange={(value: VerticalPosition) => setVerticalPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horizontal Position</Label>
              <Select value={horizontalPosition} onValueChange={(value: HorizontalPosition) => setHorizontalPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {fontSize[0]}pt</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={8}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontStyle} onValueChange={(value: FontStyle) => setFontStyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="italic">Italic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={addPageNumbers}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Page Numbers...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF with Page Numbers
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ToolPage>
  );
};

export default AddPageNumbers;
