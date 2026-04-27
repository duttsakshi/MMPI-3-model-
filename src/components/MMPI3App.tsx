import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MMPI3_ITEMS, MMPI3Item } from '../constants/items';
import { 
  VALIDITY_SCALES, 
  INFREQUENT_SCALES, 
  BIAS_VIRTUE_SCALES, 
  HO_SCALES, 
  RC_SCALES, 
  SOMATIC_COGNITIVE_SCALES, 
  INTERNALIZING_SCALES, 
  EXTERNALIZING_SCALES, 
  INTERPERSONAL_SCALES, 
  PSY5_SCALES,
  ScoringScale, 
  ValidityScale 
} from '../constants/scales';
import { speakText } from '../services/ttsService';
import { scoreMMPI3, MMPIReport, ScaleResult, MMPIResponse } from '../services/scoringService';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, BarChart3, RotateCcw, Info } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  age: number;
  gender: string;
  date: string;
  clientId: string;
}


export default function MMPI3App() {
  const [step, setStep] = useState<'welcome' | 'dashboard' | 'survey' | 'results'>('welcome');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [responses, setResponses] = useState<Record<number, MMPIResponse>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(MMPI3_ITEMS.length / ITEMS_PER_PAGE);
  const currentItems = MMPI3_ITEMS.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const progress = ((currentPage + 1) / totalPages) * 100;

  // Form state for new client
  const [newClient, setNewClient] = useState({
    name: '',
    age: '',
    gender: 'Other',
    clientId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      age: parseInt(newClient.age),
      gender: newClient.gender,
      clientId: newClient.clientId,
      date: newClient.date
    };
    setClients(prev => [...prev, client]);
    setNewClient({
      name: '',
      age: '',
      gender: 'Other',
      clientId: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const startAssessment = (client: Client) => {
    setSelectedClient(client);
    setStep('survey');
  };

  const handleResponse = (itemId: number, value: MMPIResponse) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('results');
    }
  };

  const handleSpeak = async (item: MMPI3Item) => {
    if (isSpeaking !== null) return;
    setIsSpeaking(item.id);
    await speakText(item.text);
    setIsSpeaking(null);
  };

  const resetSurvey = () => {
    setResponses({});
    setCurrentPage(0);
    setStep('welcome');
  };

  const report: MMPIReport | null = React.useMemo(() => {
    if (step === 'results') {
      return scoreMMPI3(responses);
    }
    return null;
  }, [responses, step]);

  const renderScaleResults = (title: string, scales: ScoringScale[], colorClass: string) => (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 ml-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scales.map((scale, i) => {
          const result = report?.scales[scale.name];
          if (!result) return null;

          const rawScore = result.raw;
          const tDisplay = result.tDisplay;
          const maxScore = scale.items.length + (scale.reverseItems?.length || 0);
          const percentage = (rawScore / maxScore) * 100;
          
          return (
            <div key={`${title}-${i}`} className={`bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all border-l-4 ${colorClass}`}>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{scale.name}</h3>
                    {result.isCritical && rawScore > 0 && (
                      <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Review Required</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{scale.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{rawScore}</span>
                    <span className="text-gray-300 font-bold text-xs">/ {maxScore}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">T-Score:</span>
                    <span className="text-sm font-black text-[#1A1A1A]">{tDisplay}</span>
                  </div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <motion.div 
                  className={`h-full ${colorClass.replace('border-l-', 'bg-')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              {result.interpretation && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-[11px] text-gray-600 leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-help">
                    {result.interpretation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-orange-100">
      <header className="border-b border-gray-100 py-6 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('welcome')}>
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200">M</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">MMPI-3</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Assessment Software</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {step !== 'survey' && (
            <button 
              onClick={() => setStep('dashboard')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${step === 'dashboard' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Client Dashboard
            </button>
          )}
          {step === 'survey' && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-400">Page</p>
                <p className="text-sm font-bold">{currentPage + 1} / {totalPages}</p>
              </div>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8 py-12"
            >
              <div className="space-y-4">
                <h2 className="text-5xl font-light tracking-tight leading-tight">
                  Minnesota Multiphasic <br />
                  <span className="font-bold text-orange-600 italic">Personality Inventory-3</span>
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
                  A comprehensive clinical assessment tool designed to provide objective data for psychological evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { icon: CheckCircle2, title: "335 Items", desc: "True/False responses" },
                  { icon: Volume2, title: "Audio Support", desc: "Built-in item reading" },
                  { icon: BarChart3, title: "Real-time Scoring", desc: "Instant scale analysis" }
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <feature.icon className="w-8 h-8 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setStep('dashboard')}
                  className="group relative inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-orange-600 transition-all duration-300 shadow-xl hover:shadow-orange-200"
                >
                  Go to Client Dashboard
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setStep('survey')}
                  className="text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Skip to Quick Assessment
                </button>
              </div>
              
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                Confidential & Secure Assessment Environment
              </p>
            </motion.div>
          )}

          {step === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight">Client Dashboard</h2>
                  <p className="text-gray-500">Manage your clients and start new assessments.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Client Form */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm sticky top-32">
                    <h3 className="text-xl font-bold mb-6">Add New Client</h3>
                    <form onSubmit={handleAddClient} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-orange-600 focus:ring-0 transition-colors outline-none"
                          value={newClient.name}
                          onChange={e => setNewClient({...newClient, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Age</label>
                          <input 
                            required
                            type="number" 
                            placeholder="Age"
                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-orange-600 focus:ring-0 transition-colors outline-none"
                            value={newClient.age}
                            onChange={e => setNewClient({...newClient, age: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Gender</label>
                          <select 
                            className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-orange-600 focus:ring-0 transition-colors outline-none bg-white"
                            value={newClient.gender}
                            onChange={e => setNewClient({...newClient, gender: e.target.value})}
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Client ID</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. CL-001"
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-orange-600 focus:ring-0 transition-colors outline-none"
                          value={newClient.clientId}
                          onChange={e => setNewClient({...newClient, clientId: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Date</label>
                        <input 
                          required
                          type="date" 
                          className="w-full px-4 py-3 rounded-2xl border border-gray-100 focus:border-orange-600 focus:ring-0 transition-colors outline-none"
                          value={newClient.date}
                          onChange={e => setNewClient({...newClient, date: e.target.value})}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-gray-100 mt-4"
                      >
                        Add Client
                      </button>
                    </form>
                  </div>
                </div>

                {/* Client Table */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="text-xl font-bold">Client Records</h3>
                      <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {clients.length} Total
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Client ID</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Name</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Details</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</th>
                            <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {clients.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic">
                                No client records found. Add your first client to begin.
                              </td>
                            </tr>
                          ) : (
                            clients.map(client => (
                              <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-4 font-mono text-xs font-bold text-orange-600">{client.clientId}</td>
                                <td className="px-8 py-4 font-bold">{client.name}</td>
                                <td className="px-8 py-4 text-xs text-gray-500">
                                  {client.age}y &bull; {client.gender}
                                </td>
                                <td className="px-8 py-4 text-xs text-gray-400">{client.date}</td>
                                <td className="px-8 py-4">
                                  <button 
                                    onClick={() => startAssessment(client)}
                                    className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 hover:text-white transition-all"
                                  >
                                    Start Test
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'survey' && (
            <motion.div 
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                {currentItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start gap-6 mb-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600 font-mono font-bold text-[10px] uppercase tracking-widest">Item #{item.id}</span>
                          <div className="h-px flex-1 bg-gray-50"></div>
                        </div>
                        <h3 className="text-xl font-medium leading-relaxed">
                          {item.text}
                        </h3>
                      </div>
                      <button 
                        onClick={() => handleSpeak(item)}
                        disabled={isSpeaking !== null}
                        className={`p-3 rounded-xl border border-gray-100 shadow-sm transition-all ${isSpeaking === item.id ? 'bg-orange-50 text-orange-600' : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-orange-600'}`}
                      >
                        <Volume2 className={`w-5 h-5 ${isSpeaking === item.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleResponse(item.id, 'T')}
                        className={`group p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${responses[item.id] === 'T' ? 'border-orange-600 bg-orange-50/30' : 'border-gray-50 bg-white hover:border-orange-200'}`}
                      >
                        <span className={`font-bold ${responses[item.id] === 'T' ? 'text-orange-600' : 'text-gray-400'}`}>True</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${responses[item.id] === 'T' ? 'border-orange-600' : 'border-gray-100'}`}>
                          {responses[item.id] === 'T' && <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>}
                        </div>
                      </button>

                      <button 
                        onClick={() => handleResponse(item.id, 'F')}
                        className={`group p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${responses[item.id] === 'F' ? 'border-[#1A1A1A] bg-gray-50' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                      >
                        <span className={`font-bold ${responses[item.id] === 'F' ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>False</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${responses[item.id] === 'F' ? 'border-[#1A1A1A]' : 'border-gray-100'}`}>
                          {responses[item.id] === 'F' && <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]"></div>}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-gray-100 sticky bottom-0 bg-[#FDFCFB]/80 backdrop-blur-md py-6 z-10">
                <button 
                  onClick={() => currentPage > 0 && setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 text-gray-400 hover:text-[#1A1A1A] disabled:opacity-30 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Page
                </button>
                
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {Object.keys(responses).length} / {MMPI3_ITEMS.length} Answered
                </div>

                <button 
                  onClick={handleNextPage}
                  className="group flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg shadow-gray-200"
                >
                  {currentPage === totalPages - 1 ? 'Finish Assessment' : 'Next Page'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold">Assessment Complete</h2>
                {selectedClient && (
                  <div className="inline-block bg-gray-50 px-6 py-2 rounded-full text-sm font-bold text-gray-500">
                    Client: <span className="text-[#1A1A1A]">{selectedClient.name}</span> ({selectedClient.clientId})
                  </div>
                )}
                <p className="text-gray-500">Your responses have been processed. Below is the preliminary scale analysis.</p>
              </div>

              <div className="grid grid-cols-1 gap-12">
                {/* Validity Inconsistency Scales */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 ml-4">Validity Scales (Inconsistency)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {VALIDITY_SCALES.map((scale, i) => {
                      const result = report?.scales[scale.name];
                      if (!result) return null;

                      const rawScore = result.raw;
                      const tDisplay = result.tDisplay;
                      // For TRIN, the range is 0-33. For VRIN 0-53. For CRIN 0-86.
                      // scale.pairs.length gives the correct max for all.
                      const maxScore = scale.pairs.length;
                      const percentage = (rawScore / maxScore) * 100;
                      
                      return (
                        <div key={`validity-${i}`} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold">{scale.name}</h3>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{scale.description}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-blue-600">{rawScore}</span>
                                <span className="text-gray-300 font-bold text-xs">/ {maxScore}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md mt-1">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">T-Score:</span>
                                <span className="text-sm font-black text-blue-700">{tDisplay}</span>
                              </div>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <motion.div 
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          {result.interpretation && (
                            <div className="mt-4 pt-4 border-t border-gray-50">
                              <p className="text-[11px] text-gray-600 leading-relaxed italic">
                                {result.interpretation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {renderScaleResults("Infrequent Responses", INFREQUENT_SCALES, "border-l-red-500")}
                {renderScaleResults("Bias & Virtue", BIAS_VIRTUE_SCALES, "border-l-indigo-500")}
                {renderScaleResults("Higher-Order Scales", HO_SCALES, "border-l-purple-500")}
                {renderScaleResults("Restructured Clinical Scales", RC_SCALES, "border-l-orange-500")}
                {renderScaleResults("Somatic/Cognitive Scales", SOMATIC_COGNITIVE_SCALES, "border-l-teal-500")}
                {renderScaleResults("Internalizing Scales", INTERNALIZING_SCALES, "border-l-pink-500")}
                {renderScaleResults("Externalizing Scales", EXTERNALIZING_SCALES, "border-l-yellow-500")}
                {renderScaleResults("Interpersonal Scales", INTERPERSONAL_SCALES, "border-l-cyan-500")}
                {renderScaleResults("PSY-5 Scales", PSY5_SCALES, "border-l-emerald-500")}
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 flex gap-6 items-start">
                <AlertCircle className="w-8 h-8 text-orange-600 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-bold text-orange-900">Clinical Note</h4>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    These scores are raw calculations based on the provided item groupings. A full MMPI-3 interpretation requires standardized T-scores, validity scale checks, and professional clinical oversight. This tool is for educational and preliminary screening purposes only.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setStep('dashboard')}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back to Dashboard
                </button>
                <button 
                  onClick={resetSurvey}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Assessment
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-gray-200"
                >
                  Print Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
          MMPI-3 Assessment Software &copy; 2026 &bull; Professional Edition
        </p>
      </footer>
    </div>
  );
}
