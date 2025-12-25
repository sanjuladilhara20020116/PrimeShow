import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";


const DateSelect = ({ id }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [startIndex, setStartIndex] = useState(0);

  const VISIBLE = 3; // number of dates visible at once
  const TOTAL_DAYS = 10; // max days to show

  // Generate current + future dates dynamically
  const today = new Date();
  const dates = Array.from({ length: TOTAL_DAYS }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split("T")[0]; // format: YYYY-MM-DD
  });

  const visibleDates = dates.slice(startIndex, startIndex + VISIBLE);

  const onBookHandler = () => {
    if (!selected) {
      toast.error("Please select a date");
      document.getElementById("dateSelect")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate(`/movies/${id}/${selected}`);
    window.scrollTo(0, 0);
  };

  const prev = () => setStartIndex((prev) => Math.max(prev - 1, 0));
  const next = () => setStartIndex((prev) => Math.min(prev + 1, dates.length - VISIBLE));

  return (
    <div id="dateSelect" className="pt-24">
      <div className="p-8 bg-primary/10 border border-primary/20 rounded-lg relative overflow-hidden">
        {/* Blur circles behind the calendar */}
        <BlurCircle top="-80px" left="-80px" />
        <BlurCircle top="80px" right="-40px" />
       

        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div>
            <p className="text-lg font-semibold">Choose Date</p>

            <div className="flex items-center gap-6 text-sm mt-5">
              {/* LEFT CHEVRON */}
              <ChevronLeft
                size={28}
                onClick={prev}
                className={`cursor-pointer ${
                  startIndex === 0 ? "opacity-30 pointer-events-none" : "opacity-70 hover:opacity-100"
                }`}
              />

              {/* DATES */}
              <div className="grid grid-cols-3 md:flex gap-4">
                {visibleDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelected(date)}
                    className={`flex flex-col items-center justify-center h-14 w-14 rounded-md transition
                      ${selected === date ? "bg-primary text-white" : "bg-gray-800/40 border border-primary/40 hover:bg-primary/20"}`}
                  >
                    <span className="font-medium">{new Date(date).getDate()}</span>
                    <span className="text-xs opacity-80">
                      {new Date(date).toLocaleString("en-US", { month: "short" })}
                    </span>
                  </button>
                ))}
              </div>

              {/* RIGHT CHEVRON */}
              <ChevronRight
                size={28}
                onClick={next}
                className={`cursor-pointer ${
                  startIndex >= dates.length - VISIBLE ? "opacity-30 pointer-events-none" : "opacity-70 hover:opacity-100"
                }`}
              />
            </div>
          </div>

          <button
            onClick={onBookHandler}
            className="bg-primary text-white px-8 py-2 mt-6 md:mt-0 rounded hover:bg-primary-dull transition-all active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelect;
