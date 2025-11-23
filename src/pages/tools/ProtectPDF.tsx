import { useState } from "react";
import ToolPage from "@/components/ToolPage";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Lock, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProtectPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
  };

  const handleProtect = async () => {
    if (!file || !password) {
      toast({
        title: "Missing Information",
        description: "Please upload a PDF and enter a password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 4 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("password", password);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protect-pdf`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to protect PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `protected-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Protected",
        description: "Your PDF is now password-protected and ready to download.",
      });

      // Reset form
      setFile(null);
      setPassword("");
    } catch (error) {
      console.error("Error protecting PDF:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to protect PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPage
      title="Protect PDF"
      description="Secure your PDF with password protection"
    >
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Due to browser limitations, true PDF encryption is processed server-side. 
            The password will secure your PDF and be required to open the file.
          </AlertDescription>
        </Alert>

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
                <h3 className="text-lg font-semibold mb-4">Set Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password (min. 4 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isProcessing}
                  />
                  <p className="text-sm text-muted-foreground">
                    This password will be required to open the PDF file.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleProtect}
                disabled={isProcessing || !password}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Protecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Protect & Download
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

export default ProtectPDF;
