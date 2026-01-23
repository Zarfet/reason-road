import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignValue } from '@/types/assessment';
import { DESIGN_VALUES } from '@/types/assessment';

interface SortableValueCardProps {
  value: DesignValue;
  description: string;
  rank: number;
}

function SortableValueCard({ value, description, rank }: SortableValueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: value });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 rounded-xl border-2 bg-card p-4 transition-all duration-200',
        isDragging 
          ? 'border-accent shadow-lg scale-[1.02] z-50 bg-nexus-emerald-light' 
          : 'border-border hover:border-accent/30 hover:shadow-md'
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none p-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  );
}

interface ValuesRankingProps {
  values: DesignValue[];
  onChange: (values: DesignValue[]) => void;
}

export function ValuesRanking({ values, onChange }: ValuesRankingProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = values.indexOf(active.id as DesignValue);
      const newIndex = values.indexOf(over.id as DesignValue);
      onChange(arrayMove(values, oldIndex, newIndex));
    }
  };

  const getDescription = (value: DesignValue) => {
    return DESIGN_VALUES.find(v => v.value === value)?.description || '';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={values} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {values.map((value, index) => (
            <SortableValueCard
              key={value}
              value={value}
              description={getDescription(value)}
              rank={index + 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
