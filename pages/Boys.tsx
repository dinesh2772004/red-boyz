
import React from 'react';
// Fix: Added missing Users icon import
import { Phone, Instagram, Search, Users } from 'lucide-react';
import { store } from '../store';

export const Boys: React.FC = () => {
  const [members, setMembers] = React.useState(store.getState().members);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    store.fetchState().then(state => setMembers(state.members));
  }, []);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-20">
        <span className="inline-block px-4 py-1.5 mb-4 glass text-red-600 text-xs font-black uppercase tracking-widest rounded-full border border-red-100">Our Community</span>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">Meet The <span className="text-red-600">Boys</span></h1>
        <div className="h-2 w-24 bg-red-600 mx-auto rounded-full mb-10"></div>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Find a friend..."
            className="pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-red-50 shadow-sm w-full font-bold text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-red-200 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
          >
            <div className="aspect-square overflow-hidden relative">
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="p-4 md:p-6 text-center">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate mb-4">{member.name}</h3>
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <a
                  href={`tel:${member.phone}`}
                  title={member.phone}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                >
                  <Phone size={18} />
                </a>
                <a
                  href={`https://instagram.com/${member.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                >
                  <Instagram size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 text-lg">No members found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
