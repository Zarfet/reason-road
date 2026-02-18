import nexusLogo from '@/assets/nexus-logo.png';

interface NexusLogoProps {
  iconSize?: number;
}

export function NexusLogo({ iconSize = 36 }: NexusLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={nexusLogo} 
        alt="NEXUS Logo" 
        style={{ height: iconSize, width: iconSize }} 
        className="object-contain"
      />
      <div className="flex flex-col">
        <span className="font-extrabold text-xl tracking-tighter text-foreground leading-none">NEXUS</span>
        <span className="font-mono text-[9px] text-muted-foreground tracking-wider leading-none mt-0.5">EVIDENCE-BASED INTERFACE SELECTION FRAMEWORK</span>
      </div>
    </div>
  );
}
