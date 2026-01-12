
import React from 'react';
import { Calendar, MapPin, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { store } from '../store';
import { EventStatus } from '../types';

export const Events: React.FC = () => {
  const [events, setEvents] = React.useState(store.getState().events);

  React.useEffect(() => {
    store.fetchState().then(state => setEvents(state.events));
  }, []);

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-20">
        <span className="inline-block px-4 py-1.5 mb-4 glass text-red-600 text-xs font-black uppercase tracking-widest rounded-full border border-red-100">Our Journey</span>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Event <span className="text-red-600">History</span></h1>
        <div className="h-2 w-24 bg-red-600 mx-auto rounded-full"></div>
      </div>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {sortedEvents.map((evt, idx) => {
          const isUpcoming = evt.status === EventStatus.UPCOMING;
          const isLeft = idx % 2 === 0;

          return (
            <div key={evt.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
              {/* Dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isUpcoming ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {isUpcoming ? <Clock size={20} /> : <CheckCircle2 size={20} />}
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[45%] p-8 rounded-[2.5rem] bg-white border border-slate-100 premium-card group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <time className={`font-bold text-sm uppercase tracking-wider ${isUpcoming ? 'text-red-600' : 'text-slate-400'}`}>
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isUpcoming ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{evt.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">{evt.description}</p>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-6">
                    <MapPin size={16} />
                    {evt.venue}
                  </div>
                  <button className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${isUpcoming ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white'}`}>
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
