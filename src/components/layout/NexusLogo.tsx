import nexusLogo from '@/assets/nexus-logo.png';

interface NexusLogoProps {
  iconSize?: number;
}

export function NexusLogo({ iconSize = 36 }: NexusLogoProps) {
  return (
    <img 
      src={nexusLogo} 
      alt="NEXUS Logo" 
      style={{ height: iconSize, width: iconSize }} 
      className="object-contain"
    />
  );
}
