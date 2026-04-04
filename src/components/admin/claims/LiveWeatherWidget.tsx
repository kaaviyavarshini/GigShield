import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, Wind, ThermometerSun, AlertTriangle, 
  RefreshCw, Radio, ChevronRight, Activity, MapPin,
  ShieldAlert, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeatherAlert {
  id: string;
  event: string;
  severity: string;
  instruction: string;
  areaDesc: string;
  senderName: string;
  effective: string;
}

export function LiveWeatherWidget() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Using public NWS API with proper User-Agent
      const res = await fetch('https://api.weather.gov/alerts/active?area=CA', {
        headers: {
          'Accept': 'application/geo+json',
          'User-Agent': '(gigshield.com, admin@gigshield.com)'
        }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (data.features && data.features.length > 0) {
        setAlerts(data.features.slice(0, 3).map((f: any) => ({
          id: f.properties.id,
          event: f.properties.event,
          severity: f.properties.severity,
          instruction: f.properties.instruction || 'Monitor local advisories.',
          areaDesc: f.properties.areaDesc.split(';')[0],
          senderName: f.properties.senderName,
          effective: new Date(f.properties.effective).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('NWS Fetch Error:', err);
      setError(true);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden bg-white border-[#E2E8F0] shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Top Banner for Alerts */}
      {alerts.length > 0 && (
        <div className="bg-[#0F172A] text-white px-6 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-[#0EA5E9] rounded-full animate-pulse shadow-[0_0_8px_#0EA5E9]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em]">National Weather Service Broadcast Active</span>
          </div>
          <Badge variant="outline" className="text-white border-white/30 text-[9px] font-bold h-5 px-2 bg-white/10">
            {alerts.length} NOTIFICATIONS
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] group">
              <ShieldAlert className="w-5 h-5 group-hover:text-[#0EA5E9] transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0F172A] tracking-tight">Environmental Intel</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 bg-[#10B981] rounded-full animate-ping" />
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">NWS SAT-LINK LIVE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchWeatherData}
            disabled={loading}
            className={`p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
          >
            <RefreshCw size={14} className="text-[#64748B]" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2">
        <AnimatePresence mode="wait">
          {loading && alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center space-y-4"
            >
              <Activity className="w-8 h-8 text-[#0EA5E9]/20 animate-pulse" />
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Synchronizing Feed...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 px-4 bg-[#FFF1F2] rounded-2xl border border-[#FDA4AF]/30 text-center"
            >
              <AlertTriangle size={32} className="text-[#E11D48] mx-auto mb-3" />
              <h4 className="text-[14px] font-bold text-[#9F1239] mb-1">Connection Interrupted</h4>
              <p className="text-[11px] text-[#BE123C] mb-4 leading-relaxed px-4">Verification of NWS API credentials required for live environmental telemetry.</p>
              <button 
                onClick={fetchWeatherData}
                className="px-6 py-2 bg-white border border-[#FDA4AF] rounded-xl text-[11px] font-bold text-[#E11D48] hover:bg-[#FFE4E6] transition-all shadow-sm active:scale-95"
              >
                Reconnect Station
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {alerts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {alerts.map((alert, idx) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group p-4 bg-white border border-[#E2E8F0] rounded-2xl hover:border-[#0EA5E9]/40 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-[100px] h-full opacity-[0.03] translate-x-1/2 -rotate-12 ${
                         alert.severity === 'Extreme' ? 'bg-[#E11D48]' : 'bg-[#0EA5E9]'
                      }`}>
                         <Zap className="w-full h-full" />
                      </div>

                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${
                          alert.severity === 'Extreme' ? 'bg-[#FFF1F2] text-[#E11D48]' : 
                          alert.severity === 'Severe' ? 'bg-[#FFFAF1] text-[#D97706]' : 'bg-[#F0F9FF] text-[#0EA5E9]'
                        }`}>
                          {alert.event.toLowerCase().includes('wind') ? <Wind size={20} /> :
                           alert.event.toLowerCase().includes('heat') ? <ThermometerSun size={20} /> :
                           <CloudRain size={20} />}
                        </div>
                        
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[14px] font-bold text-[#0F172A] leading-tight">
                              {alert.event}
                            </h4>
                            <span className="text-[10px] font-bold text-[#94A3B8]">• {alert.effective}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[#64748B]">
                            <MapPin size={10} />
                            <span className="text-[11px] font-medium truncate">{alert.areaDesc}</span>
                          </div>
                        </div>

                        <Badge className={`uppercase text-[9px] font-black tracking-widest px-2.5 h-6 rounded-lg ${
                          alert.severity === 'Extreme' ? 'bg-[#E11D48] text-white' : 
                          alert.severity === 'Severe' ? 'bg-[#F59E0B] text-white' : 'bg-[#0EA5E9] text-white'
                        }`}>
                          {alert.severity}
                        </Badge>
                      </div>

                      <div className="mt-3 pl-[52px]">
                        <p className="text-[10px] text-[#94A3B8] line-clamp-2 leading-relaxed italic border-l-2 border-[#F1F5F9] pl-3">
                          {alert.instruction}
                        </p>
                      </div>

                      <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shadow-sm transform translate-x-2 group-hover:translate-x-0">
                        <ChevronRight size={14} className="text-[#64748B]" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-[#F8FAFC]/50 rounded-2xl border-2 border-dashed border-[#E2E8F0]">
                  <div className="h-16 w-16 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-center mb-5 relative">
                    <CloudRain size={28} className="text-[#CBD5E1]" />
                    <div className="absolute top-0 right-0 h-3 w-3 bg-[#10B981] rounded-full border-2 border-white" />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1E293B]">All Risk Zones Clear</h4>
                  <p className="text-[11px] text-[#64748B] max-w-[220px] mt-2 leading-relaxed">Atmospheric conditions are stable across monitored regions. No parametric triggers detected.</p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1]" />
             <span className="text-[9px] font-bold text-[#CBD5E1] uppercase tracking-[0.2em]">Data Source: NOAA / NWS Intelligence</span>
          </div>
          <span className="text-[10px] font-bold text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">SYNC: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
