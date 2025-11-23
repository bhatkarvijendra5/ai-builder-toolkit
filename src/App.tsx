import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import ConvertImage from "./pages/tools/ConvertImage";
import DocumentAnalyzer from "./pages/tools/DocumentAnalyzer";
import CompressPDF from "./pages/tools/CompressPDF";
import PDFToWord from "./pages/tools/PDFToWord";
import PDFToExcel from "./pages/tools/PDFToExcel";
import PDFToPPT from "./pages/tools/PDFToPPT";
import WordToPDF from "./pages/tools/WordToPDF";
import SignPDF from "./pages/tools/SignPDF";
import JPGToPDF from "./pages/tools/JPGToPDF";
import PDFToJPG from "./pages/tools/PDFToJPG";
import OrganizePDF from "./pages/tools/OrganizePDF";
import AddPageNumbers from "./pages/tools/AddPageNumbers";
import ResizeImage from "./pages/tools/ResizeImage";
import WatermarkPDF from "./pages/tools/WatermarkPDF";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tools/merge-pdf" element={<MergePDF />} />
          <Route path="/tools/split-pdf" element={<SplitPDF />} />
          <Route path="/tools/convert-image" element={<ConvertImage />} />
          <Route path="/tools/document-analyzer" element={<DocumentAnalyzer />} />
          <Route path="/tools/compress-pdf" element={<CompressPDF />} />
          <Route path="/tools/pdf-to-word" element={<PDFToWord />} />
          <Route path="/tools/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/tools/pdf-to-ppt" element={<PDFToPPT />} />
          <Route path="/tools/word-to-pdf" element={<WordToPDF />} />
          <Route path="/tools/sign-pdf" element={<SignPDF />} />
          <Route path="/tools/jpg-to-pdf" element={<JPGToPDF />} />
          <Route path="/tools/pdf-to-jpg" element={<PDFToJPG />} />
          <Route path="/tools/organize-pdf" element={<OrganizePDF />} />
          <Route path="/tools/page-numbers" element={<AddPageNumbers />} />
          <Route path="/tools/resize-image" element={<ResizeImage />} />
          <Route path="/tools/watermark-pdf" element={<WatermarkPDF />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
