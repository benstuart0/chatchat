import { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface Point {
  x: number;
  y: number;
}

interface DrawEvent {
  points: Point[];
  color: string;
  clear?: boolean;
}

interface MessageContent {
  text?: string;
  gifUrl?: string;
}

interface Message {
  type: 'draw' | 'chat' | 'system' | 'users';
  content: string | DrawEvent | MessageContent | string[];
  username?: string;
  messageType?: 'text' | 'gif' | 'draw';
}

interface DrawingBoardProps {
  onDraw: (data: DrawEvent) => void;
  messages: Message[];
}

export function DrawingBoard({ onDraw, messages }: DrawingBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const currentPoints = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial styles
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [currentColor]);

  // Handle receiving draw data from other users
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter only draw messages
    const drawMessages = messages.filter(msg => msg.type === 'draw');
    
    // Find the last clear message index
    const lastClearIndex = drawMessages.reduceRight((acc, msg, index) => {
      if (acc === -1 && (msg.content as DrawEvent).clear) {
        return index;
      }
      return acc;
    }, -1);

    // Get messages after the last clear (or all if no clear)
    const relevantMessages = lastClearIndex === -1 
      ? drawMessages 
      : drawMessages.slice(lastClearIndex + 1);

    // Draw all messages in sequence
    relevantMessages.forEach(msg => {
      const drawData = msg.content as DrawEvent;
      if (!drawData.points || drawData.points.length < 2) return;

      ctx.strokeStyle = drawData.color;
      ctx.beginPath();
      ctx.moveTo(drawData.points[0].x, drawData.points[0].y);

      for (let i = 1; i < drawData.points.length; i++) {
        ctx.lineTo(drawData.points[i].x, drawData.points[i].y);
      }

      ctx.stroke();
    });
  }, [messages]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    currentPoints.current = [{ x, y }];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = currentColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPoints.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentPoints.current.length > 0) {
      onDraw({
        points: currentPoints.current,
        color: currentColor,
      });
    }
    currentPoints.current = [];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDraw({ points: [], color: currentColor, clear: true });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-8 h-8"
          />
          <Button variant="outline" onClick={clearCanvas}>
            Clear Canvas
          </Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-[500px] bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
        </div>
      </div>
    </Card>
  );
}