'use client';

import Mindmap from '@/components/mindmap';
import React from 'react';

export default function Home() {
  return (
    <main className="h-screen">
      <Mindmap isFullScreen={false} />
    </main>
  );
}
