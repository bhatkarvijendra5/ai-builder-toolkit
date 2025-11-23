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
          
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Work Faster. Convert Smarter. Create Better.
          </h1>
          
          <p className="mb-8 text-base text-muted-foreground md:text-lg">
            Merge, split, compress, convert, and edit your documents with professional-grade tools.
            Fast, secure, and completely free.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
