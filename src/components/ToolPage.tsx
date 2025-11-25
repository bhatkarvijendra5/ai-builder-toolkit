import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "./SEO";

interface ToolPageProps {
  title: string;
  description: string;
  children: ReactNode;
  keywords?: string;
  canonicalUrl?: string;
}

const ToolPage = ({ title, description, children, keywords, canonicalUrl }: ToolPageProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title={title}
        description={description}
        keywords={keywords}
        canonicalUrl={canonicalUrl}
      />
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">{title}</h1>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToolPage;
