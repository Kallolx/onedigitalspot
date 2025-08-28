import React from 'react';
import { Card } from './card';

type CompactStatProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
};

const CompactStat: React.FC<CompactStatProps> = ({
  title,
  value,
  icon,
  className = '',
}) => {
  return (
    <Card className={`flex items-center p-2 rounded-lg ${className} bg-background`}>
      <div className="flex-shrink-0 mr-3 w-8 h-10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs text-foreground/70">{title}</span>
        <span className="text-lg font-bold font-anekbangla">{value}</span>
      </div>
    </Card>
  );
};

export default CompactStat;
