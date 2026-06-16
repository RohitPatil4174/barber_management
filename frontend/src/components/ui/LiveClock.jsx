import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <Clock size={20} className="text-primary" />
        {format(time, 'hh:mm:ss a')}
      </div>
      <div className="text-muted text-sm font-medium uppercase tracking-wide">
        {format(time, 'EEEE, MMMM do yyyy')}
      </div>
    </div>
  );
};

export default LiveClock;
