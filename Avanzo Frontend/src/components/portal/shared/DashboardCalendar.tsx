import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export const DashboardCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-700 h-full">
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50 bg-slate-50/10 rounded-t-[2.5rem]">
        <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
          <CalendarIcon className="size-5 text-violet-600" />
          Task Schedule
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-black text-slate-900 min-w-[120px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            
            // Generate mock events for visual demonstration
            const dailyEvents = [];
            if (day !== null) {
              if (day % 5 === 0) {
                dailyEvents.push({ title: "Client Update Meeting", time: "10:00 AM", type: "meeting", color: "bg-amber-500" });
              }
              if (day % 8 === 0) {
                dailyEvents.push({ title: "Cybersol Milestone", time: "EOD", type: "deadline", color: "bg-violet-400" });
              }
              if (day === 12) {
                dailyEvents.push({ title: "Security Audit Task", time: "2:00 PM", type: "task", color: "bg-emerald-500" });
              }
            }

            return (
              <div 
                key={i} 
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative group cursor-pointer transition-all ${
                  day === null ? 'invisible' : 'bg-slate-50 hover:bg-violet-50 hover:text-violet-600'
                } ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:text-white' : 'text-slate-700'}`}
              >
                {day !== null && (
                  <>
                    <span className="text-sm font-black relative z-10">{day}</span>
                    
                    {/* Render indicator dots */}
                    {dailyEvents.length > 0 && (
                      <div className="absolute bottom-2 flex gap-1 z-10">
                        {dailyEvents.map((ev, idx) => (
                          <div key={idx} className={`size-1.5 rounded-full ${ev.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                        ))}
                      </div>
                    )}

                    {/* Hover Pop-up / Tooltip */}
                    {dailyEvents.length > 0 && (
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-left p-3.5 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 scale-95 group-hover:scale-100 pointer-events-none">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 border-b border-slate-700 pb-2">
                          {currentDate.toLocaleString('default', { month: 'short' })} {day}, {currentDate.getFullYear()}
                        </p>
                        <div className="space-y-3">
                          {dailyEvents.map((ev, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <div className={`mt-1 size-2 shrink-0 rounded-full ${ev.color}`}></div>
                              <div>
                                <p className="text-[11px] font-bold leading-tight text-slate-100">{ev.title}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{ev.time} • {ev.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
