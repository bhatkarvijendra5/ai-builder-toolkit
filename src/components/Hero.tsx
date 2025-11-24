import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-4 md:pt-12 md:pb-6">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            All tools are 100% free
          </div>
          
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Work Faster. Convert Smarter. Create Better.
          </h1>
          
          <p className="mb-2 text-base text-muted-foreground md:text-lg">
            Merge, split, compress, convert, and edit your documents with professional-grade tools. Fast, secure, and completely free.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">
            A Smarter Way to Work with Files
          </h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;
