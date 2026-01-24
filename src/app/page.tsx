'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur h-14" />
        <main className="flex-1 container max-w-screen-2xl mx-auto p-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
   
    </div>
  );
}
