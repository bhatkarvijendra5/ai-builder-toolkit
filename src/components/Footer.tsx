import { FileText, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ToolHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional PDF and image tools for everyone. Free, fast, and secure.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">PDF Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tools/merge-pdf" className="hover:text-primary">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/split-pdf" className="hover:text-primary">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/compress-pdf" className="hover:text-primary">
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Image Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tools/convert-image" className="hover:text-primary">
                  Convert Images
                </Link>
              </li>
              <li>
                <Link to="/tools/compress-image" className="hover:text-primary">
                  Compress Images
                </Link>
              </li>
              <li>
                <Link to="/tools/resize-image" className="hover:text-primary">
                  Resize Images
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ToolHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
