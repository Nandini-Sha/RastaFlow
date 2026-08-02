import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, Activity, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Filter, X
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

export default function StrategicInsights() {
  const navigate = useNavigate();
  
  // Data State
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);

  // Filter State
  const [timeFilter, setTimeFilter] = useState("24h");
  const [corridorFilter, setCorridorFilter] = useState("All");

  // Drill-down Modal State
  const [selectedCategory, setSelectedCategory] = useState<{ type: string, name: string } | null>(null);

  // Initial Fetch
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
        const response = await axios.get(`${API_URL}/incidents`);
        setLiveIncidents(response.data);
      } catch (error) {
        console.error("Error fetching live incidents for insights:", error);
      }
    };
    fetchIncidents();
    // Poll every 10 seconds to keep live data fresh
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter Live Data based on selections
  const filteredIncidents = useMemo(() => {
    return liveIncidents.filter(inc => {
      // Apply Corridor Filter
      if (corridorFilter !== "All" && !inc.location.includes(corridorFilter)) {
        return false;
      }
      // Apply Time Filter
      if (inc.created_at) {
        const createdDate = new Date(inc.created_at);
        const now = new Date();
        const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        
        if (timeFilter === "24h" && diffHours > 24) return false;
        if (timeFilter === "7d" && diffHours > 24 * 7) return false;
        if (timeFilter === "30d" && diffHours > 24 * 30) return false;
      }
      return true;
    });
  }, [liveIncidents, timeFilter, corridorFilter]);

  // Total Reports KPI
  const totalReports = filteredIncidents.length;

  // Aggregate Severity Donut Chart Data
  const severityData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    filteredIncidents.forEach(inc => {
      const s = inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1).toLowerCase();
      if (counts[s as keyof typeof counts] !== undefined) {
        counts[s as keyof typeof counts]++;
      }
    });
    return [
      { name: "Low", value: counts.Low, color: "#10B981" },
      { name: "Medium", value: counts.Medium, color: "#F59E0B" },
      { name: "High", value: counts.High, color: "#EF4444" },
      { name: "Critical", value: counts.Critical, color: "#7F1D1D" }
    ].filter(item => item.value > 0); // Only show segments with data
  }, [filteredIncidents]);

  // Aggregate Types Bar Chart Data
  const typeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    filteredIncidents.forEach(inc => {
      const t = inc.type || "Unknown";
      typeMap.set(t, (typeMap.get(t) || 0) + 1);
    });
    const result = Array.from(typeMap.entries()).map(([name, count]) => ({ name, count }));
    result.sort((a, b) => b.count - a.count); // Sort descending
    return result.slice(0, 5); // Top 5 types
  }, [filteredIncidents]);

  // Aggregate Time Series Area Chart Data
  const timeSeriesData = useMemo(() => {
    const dataMap = new Map<string, { incidents: number, resolved: number }>();
    
    // Determine grouping based on filter
    filteredIncidents.forEach(inc => {
      if (!inc.created_at) return;
      const date = new Date(inc.created_at);
      let key = "";
      
      if (timeFilter === "24h") {
        // Group by hour
        key = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':')[0] + ":00";
      } else {
        // Group by Day (e.g. "Mon", "Tue" for 7d, or MM/DD for 30d)
        if (timeFilter === "7d") {
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          key = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        }
      }

      const existing = dataMap.get(key) || { incidents: 0, resolved: 0 };
      existing.incidents++;
      if (inc.status === "Resolved") existing.resolved++;
      dataMap.set(key, existing);
    });

    // Convert map to array and sort (very simplistic sort for demonstration, in a real app would sort by actual timestamp)
    return Array.from(dataMap.entries()).map(([time, counts]) => ({
      time,
      incidents: counts.incidents,
      resolved: counts.resolved
    })).reverse(); // Reverse to roughly match chronological if pulling from DB order
  }, [filteredIncidents, timeFilter]);

  const activeCount = filteredIncidents.filter(inc => inc.status === "Active").length;
  const criticalCount = filteredIncidents.filter(inc => inc.severity.toLowerCase() === "critical" && inc.status === "Active").length;
  const totalSeverity = severityData.reduce((acc, curr) => acc + curr.value, 0);

  const handleNavigateToCommand = (filterVal: string) => {
    navigate("/", { state: { severityFilter: filterVal } });
  };

  const handleChartClick = (data: any, type: string) => {
    if (data && data.name) {
      setSelectedCategory({ type, name: data.name });
    }
  };

  // Custom tooltip for charts to match glassmorphism
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8 relative">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Strategic Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            City-wide traffic analytics powered by real-time aggregated data.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 pl-2">
            <Filter className="w-4 h-4 text-gray-500" />
          </div>
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 border-none focus:ring-0 cursor-pointer"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <select 
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 border-none focus:ring-0 cursor-pointer pr-4"
          >
            <option value="All">All Corridors</option>
            <option value="ORR">Outer Ring Road</option>
            <option value="CBD">Central Business District</option>
            <option value="Bellary">Bellary Road</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Live Active */}
        <div 
          onClick={() => handleNavigateToCommand("All")}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-colors"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">Filtered Active</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>Real-time tracking</span>
          </div>
        </div>

        {/* Live Critical */}
        <div 
          onClick={() => handleNavigateToCommand("Critical")}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group cursor-pointer hover:border-red-500/50 transition-colors"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors">Filtered Critical</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{criticalCount}</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Needs immediate action</span>
          </div>
        </div>

        {/* Avg Clearance */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Clearance Time</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">N/A</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span>Pending history data</span>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reports This Period</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalReports.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            Across selected corridors
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Incident Volume Over Time ({timeFilter})</h2>
          <div className="h-80 w-full">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Reported" dataKey="incidents" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" animationDuration={1000} />
                  <Area type="monotone" name="Resolved" dataKey="resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <p>No incidents recorded in this timeframe.</p>
              </div>
            )}
          </div>
        </div>

        {/* Severity Donut Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Incidents by Severity</h2>
          <div className="h-64 w-full relative">
            {severityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      onClick={(data) => handleChartClick(data, "Severity")}
                      className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                      animationDuration={800}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalSeverity}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <AlertTriangle className="w-12 h-12 mb-2 opacity-20" />
                <p>No data</p>
              </div>
            )}
          </div>
          
          {/* Custom Legend */}
          {severityData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {severityData.map((item) => (
                <div 
                  key={item.name} 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                  onClick={() => setSelectedCategory({ type: "Severity", name: item.name })}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Causes Bar Chart (Takes up full width below) */}
        <div className="lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Most Common Incident Types</h2>
          <div className="h-72 w-full">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical" onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    handleChartClick(data.activePayload[0].payload, "Type");
                  }
                }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#374151', opacity: 0.1 }} />
                  <Bar 
                    dataKey="count" 
                    name="Incidents" 
                    radius={[0, 4, 4, 0]} 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    animationDuration={800}
                  >
                    {typeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#A78BFA'} /> 
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12 mb-2 opacity-20" />
                <p>No data</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* DRILL DOWN MODAL */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCategory.type}: {selectedCategory.name} Incidents
              </h3>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Show matching live incidents */}
              {filteredIncidents.filter(inc => 
                (selectedCategory.type === "Severity" && inc.severity.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                (selectedCategory.type === "Type" && (inc.type || "").toLowerCase().includes(selectedCategory.name.toLowerCase()))
              ).length > 0 ? (
                <div className="space-y-4">
                  {filteredIncidents.filter(inc => 
                    (selectedCategory.type === "Severity" && inc.severity.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                    (selectedCategory.type === "Type" && (inc.type || "").toLowerCase().includes(selectedCategory.name.toLowerCase()))
                  ).map((inc, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-500/50 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{inc.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{inc.location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          inc.status === "Active" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}>
                          {inc.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : inc.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No incidents match this criteria right now.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
