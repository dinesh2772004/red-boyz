
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { store } from '../store';

export const Home: React.FC = () => {
  const [appState, setAppState] = useState(store.getState());
  const [counts, setCounts] = useState({ members: 0, events: 0 });

  useEffect(() => {
    store.fetchState().then((state) => {
      setAppState({ ...state });

      // Animation logic for counters
      const targetMembers = state.members.length;
      const targetEvents = state.events.length;

      let currentM = 0;
      let currentE = 0;

      const interval = setInterval(() => {
        let updated = false;
        if (currentM < targetMembers) {
          currentM++;
          updated = true;
        }
        if (currentE < targetEvents) {
          currentE++;
          updated = true;
        }

        setCounts({ members: currentM, events: currentE });

        if (!updated) clearInterval(interval);
      }, 50);

      return () => clearInterval(interval);
    });
  }, []);

  const latestEvent = [...appState.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-600/30 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="animate-float">
            <span className="inline-block px-4 py-1.5 mb-6 glass text-red-500 text-xs font-black uppercase tracking-[0.2em] rounded-full border border-red-500/20 shadow-lg shadow-red-500/10">
              Village Unity • Brotherhood • Culture
            </span>
            <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none">
              RED <span className="text-gradient">BOYS</span>
            </h1>
          </div>
          <p className="text-xl md:text-3xl text-slate-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            எதையும் செய்யலாம், ஒரே விதி – நம்மா சேர்ந்து இருக்கணும்! <span className="text-white font-bold"><br></br>Innovation</span> & <span className="text-red-500 font-bold">Unity</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/boys" className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all transform hover:-translate-y-1 shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3">
              Meet the Boys <Users size={24} />
            </Link>
            <Link to="/events" className="w-full sm:w-auto px-10 py-5 glass-dark text-white border border-white/10 rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              History <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Users size={40} />, count: counts.members, label: 'Members', color: 'text-red-600' },
              { icon: <Calendar size={40} />, count: counts.events, label: 'Events', color: 'text-slate-900' },
              { icon: <ShieldCheck size={40} />, count: '100%', label: 'Trust', color: 'text-emerald-600' }
            ].map((stat, i) => (
              <div key={i} className="premium-card p-10 bg-slate-50 rounded-[3rem] text-center border border-slate-100 relative group">
                <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 transition-all group-hover:rotate-12">
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <h3 className={`text-6xl font-black mb-3 ${stat.color}`}>{stat.count}</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Event Spotlight */}
      {latestEvent && (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16 bg-white rounded-[4rem] overflow-hidden shadow-px border border-white p-4">
              <div className="w-full lg:w-1/2 h-[500px] rounded-[3rem] overflow-hidden">
                <img src={`https://hinduvism.com/wp-content/uploads/2024/12/Untitled-design-2024-12-02T140809.724.jpg`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt="Event" />
              </div>
              <div className="w-full lg:w-1/2 p-4 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-red-100 text-red-600 text-xs font-black rounded-full uppercase tracking-widest">
                    Next Spotlight
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">{latestEvent.name}</h2>
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-400 uppercase mb-2">When</span>
                    <div className="flex items-center gap-3 text-slate-900 font-bold">
                      <Calendar size={20} className="text-red-500" />
                      {new Date(latestEvent.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-400 uppercase mb-2">Where</span>
                    <div className="flex items-center gap-3 text-slate-900 font-bold">
                      <ArrowRight size={20} className="text-red-500" />
                      {latestEvent.venue}
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-lg mb-10 leading-relaxed font-medium">
                  {latestEvent.description}
                </p>
                <Link to={`/events`} className="inline-flex px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:gap-4 transition-all gap-3 items-center">
                  Full Event Gallery <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cultural Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Our Core <span className="text-red-600">DNA</span></h2>
            <div className="h-2 w-32 bg-red-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Unity', desc: 'Working together as one family.', icon: <Heart className="text-red-600" /> },
              { title: 'Tradition', desc: 'Preserving our village culture.', icon: <span className="text-4xl">🪔</span> },
              { title: 'Festival', desc: 'Grand village celebrations.', icon: <span className="text-4xl">🌾</span> },
              { title: 'Social', desc: 'Supporting village progress.', icon: <span className="text-4xl">🤝</span> },
            ].map((v, i) => (
              <div key={i} className="text-center p-10 rounded-[3rem] hover:bg-slate-50 transition-all duration-500 group">
                <div className="w-20 h-20 glass mx-auto flex items-center justify-center mb-8 rounded-[2rem] group-hover:scale-110 group-hover:bg-white shadow-xl">
                  {v.icon}
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-4">{v.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
