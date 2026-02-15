import { ShieldCheck, FileText } from "lucide-react";

const PoliciesSection = () => {
  return (
    <div className="px-4 py-4">
      <h3 className="font-bold text-lg text-foreground mb-3">Policies</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(145,60%,92%)] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-[hsl(145,60%,45%)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">48-hour Health Guarantee</p>
            <p className="text-xs text-muted-foreground">Initial wellness check coverage upon arrival</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(270,60%,92%)] flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[hsl(270,60%,55%)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Replacement Policy Terms</p>
            <p className="text-xs text-muted-foreground">Standard protection for unforeseen conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesSection;
