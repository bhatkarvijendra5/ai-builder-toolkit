import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
}

const ToolCard = ({ title, description, icon: Icon, href, category }: ToolCardProps) => {
  return (
    <Link to={href} className="group">
      <Card className="glass-card relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />
        
        <div className="relative p-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="mb-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {category}
          </div>
          
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default ToolCard;
