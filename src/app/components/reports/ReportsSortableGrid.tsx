import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ReportHubCard } from './ReportHubCard';
import type { ReportHubCardData } from './reportHubTypes';
import { moveItemInList } from '../../data/reportsHubPreferences';

export const REPORT_HUB_CARD_DRAG_TYPE = 'REPORT_HUB_CARD';

interface DragItem {
  id: string;
  index: number;
}

interface SortableReportCardProps {
  report: ReportHubCardData;
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onHide: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  totalCount: number;
}

function SortableReportCard({
  report,
  index,
  onReorder,
  onHide,
  onMoveLeft,
  onMoveRight,
  totalCount,
}: SortableReportCardProps) {
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: REPORT_HUB_CARD_DRAG_TYPE,
    item: (): DragItem => ({ id: report.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: REPORT_HUB_CARD_DRAG_TYPE,
    hover(item, monitor) {
      if (!cardRef.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverRect = cardRef.current.getBoundingClientRect();
      const hoverMiddleX = (hoverRect.right - hoverRect.left) / 2;
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientX = clientOffset.x - hoverRect.left;
      const hoverClientY = clientOffset.y - hoverRect.top;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX && hoverClientY > hoverMiddleY) {
        return;
      }

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drag(dragHandleRef);
  preview(drop(cardRef));

  return (
    <ReportHubCard
      ref={cardRef}
      report={report}
      mode="edit"
      dragHandleRef={dragHandleRef}
      onHide={() => onHide(report.id)}
      onMoveLeft={() => onMoveLeft(report.id)}
      onMoveRight={() => onMoveRight(report.id)}
      canMoveLeft={index > 0}
      canMoveRight={index < totalCount - 1}
      isDragging={isDragging}
      isDropTarget={isOver && !isDragging}
    />
  );
}

interface ReportsSortableGridProps {
  reports: ReportHubCardData[];
  onReorder: (reports: ReportHubCardData[]) => void;
  onHide: (id: string) => void;
}

export function ReportsSortableGrid({ reports, onReorder, onHide }: ReportsSortableGridProps) {
  const handleReorder = (fromIndex: number, toIndex: number) => {
    onReorder(moveItemInList(reports, fromIndex, toIndex));
  };

  const handleMoveLeft = (id: string) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index > 0) handleReorder(index, index - 1);
  };

  const handleMoveRight = (id: string) => {
    const index = reports.findIndex((r) => r.id === id);
    if (index >= 0 && index < reports.length - 1) handleReorder(index, index + 1);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report, index) => (
        <SortableReportCard
          key={report.id}
          report={report}
          index={index}
          totalCount={reports.length}
          onReorder={handleReorder}
          onHide={onHide}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
        />
      ))}
    </div>
  );
}
