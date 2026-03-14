import { Shield, ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium mb-6">
          <Shield className="h-4 w-4" />
          GigShield
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
          Parametric Insurance for Gig Workers
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          AI-powered, real-time coverage that pays out automatically when disruptions hit — no paperwork, no delays.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/worker")}
            className="h-12 px-6 bg-worker text-worker-foreground hover:bg-worker/90"
          >
            <Zap className="mr-2 h-4 w-4" />
            Worker App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="h-12 px-6"
          >
            <Users className="mr-2 h-4 w-4" />
            Admin Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
