import React, { useState, useRef, useEffect } from 'react';

const ComparisonSlider = ({ before, after }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.pageX || e.touches[0].pageX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video overflow-hidden rounded-2xl cursor-col-resize select-none border border-white/10"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img src={after} className="absolute inset-0 w-full h-full object-contain" alt="After" />
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-contain max-w-none" alt="Before" />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-white">
          Original
        </div>
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-primary rounded-full" />
            <div className="w-1 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/80 backdrop-blur-md rounded-full text-xs font-bold border border-primary/20 text-white">
        Processed
      </div>
    </div>
  );
};

export default ComparisonSlider;
