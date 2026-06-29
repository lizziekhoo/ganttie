"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface Designer {
  id: string;
  name: string;
  role: string;
  image: string;
}

export const DEFAULT_DESIGNERS: Designer[] = [
  {
    id: '1',
    name: 'Chadrack',
    role: 'Director of Photography',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: 'Mak VieSAinte',
    role: 'Founder',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: 'Osiris Balonga',
    role: 'Lead Front-End',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Jacques',
    role: 'Product Owner',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: 'Riche Makso',
    role: 'CTO - Product Designer',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Jemima',
    role: 'Make-Up Artiste',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
];

interface DesignerTaskGridProps {
  designers?: Designer[];
  onSelectDesigner?: (designer: Designer) => void;
  onInviteDesigner?: () => void;
}

export default function DesignerTaskGrid({
  designers = DEFAULT_DESIGNERS,
  onSelectDesigner,
  onInviteDesigner,
}: DesignerTaskGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Calculate placeholder cards needed to fill grid to multiple of 5
  const remainder = designers.length % 5;
  const placeholdersNeeded = remainder === 0 ? 0 : 5 - remainder;

  return (
    <div className="font-sans">
      {/* ── Designer grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 md:gap-6">
        {designers.map((designer) => (
          <DesignerCard
            key={designer.id}
            designer={designer}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={onSelectDesigner}
          />
        ))}
        {/* ── Invite Designer placeholder cards to fill grid ── */}
        {Array.from({ length: placeholdersNeeded }).map((_, i) => (
          <InviteDesignerCard
            key={`invite-${i}`}
            onInvite={onInviteDesigner}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Designer card (photo + name below)
───────────────────────────────────────── */

function DesignerCard({
  designer,
  hoveredId,
  onHover,
  onSelect,
}: {
  designer: Designer;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect?: (designer: Designer) => void;
}) {
  const router = useRouter();
  const isActive = hoveredId === designer.id;
  const isDimmed = hoveredId !== null && !isActive;

  const handleClick = () => {
    // Navigate to designer-specific tasks page
    router.push(`/tasks/${designer.id}`);
    // Optional: Call onSelect if provided for backwards compatibility
    onSelect?.(designer);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => onHover(designer.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'flex flex-col items-center gap-3 cursor-pointer transition-opacity duration-300 text-left',
        isDimmed ? 'opacity-50' : 'opacity-100',
      )}
    >
      <div className="w-full aspect-square overflow-hidden rounded-xl">
        <img
          src={designer.image}
          alt={designer.name}
          className="w-full h-full object-cover transition-[filter] duration-500"
          style={{
            filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)',
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            'text-sm md:text-base font-semibold leading-none tracking-tight transition-colors duration-300 text-center',
            isActive ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          {designer.name}
        </span>
        <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground text-center">
          {designer.role}
        </p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   Invite Designer placeholder card
───────────────────────────────────────── */

function InviteDesignerCard({ onInvite }: { onInvite?: () => void }) {
  return (
    <button
      type="button"
      onClick={onInvite}
      className="flex flex-col items-center gap-3 cursor-pointer text-left group"
    >
      <div className="w-full aspect-square overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20 group-hover:border-muted-foreground/50 group-hover:bg-muted/30 transition-colors duration-300">
        <Plus className="w-8 h-8 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors duration-300" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm md:text-base font-semibold leading-none tracking-tight text-muted-foreground/70">
          Invite Designer
        </span>
        <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
          Add to team
        </p>
      </div>
    </button>
  );
}
