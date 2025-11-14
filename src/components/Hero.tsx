import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 gradient-hero opacity-10" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>All tools are 100% free</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Every tool you need to work with{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              PDFs and Images
            </span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Merge, split, compress, convert, and edit your documents with professional-grade tools.
            Fast, secure, and completely free.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gradient-primary group shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              onClick={scrollToTools}
            >
              Explore All Tools
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 hover:bg-secondary"
            >
              Learn More
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">28+</div>
              <div className="mt-1 text-sm text-muted-foreground">Tools Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">100%</div>
              <div className="mt-1 text-sm text-muted-foreground">Free to Use</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">Fast</div>
              <div className="mt-1 text-sm text-muted-foreground">Processing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
