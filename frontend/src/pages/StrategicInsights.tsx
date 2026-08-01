import { useState, useEffect } from "react";
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

// --- MOCK AGGREGATE DATA FOR CHARTS ---
const mockTimeSeries24h = [
  { time: "00:00", incidents: 12, resolved: 10 },
  { time: "04:00", incidents: 8, resolved: 15 },
  { time: "08:00", incidents: 45, resolved: 20 },
  { time: "12:00", incidents: 30, resolved: 40 },
  { time: "16:00", incidents: 55, resolved: 35 },
  { time: "20:00", incidents: 25, resolved: 45 },
  { time: "24:00", incidents: 15, resolved: 20 },
];

const mockTimeSeries7d = [
  { time: "Mon", incidents: 120, resolved: 110 },
  { time: "Tue", incidents: 85, resolved: 90 },
  { time: "Wed", incidents: 145, resolved: 120 },
  { time: "Thu", incidents: 130, resolved: 140 },
  { time: "Fri", incidents: 155, resolved: 135 },
  { time: "Sat", incidents: 250, resolved: 245 },
  { time: "Sun", incidents: 215, resolved: 220 },
];

const mockTimeSeries30d = [
  { time: "1-5", incidents: 520, resolved: 510 },
  { time: "6-10", incidents: 485, resolved: 490 },
  { time: "11-15", incidents: 645, resolved: 620 },
  { time: "16-20", incidents: 530, resolved: 540 },
  { time: "21-25", incidents: 655, resolved: 635 },
  { time: "26-30", incidents: 750, resolved: 745 },
];

const mockTypeData24h = [
  { name: "Breakdown", count: 120 },
  { name: "Accident", count: 85 },
  { name: "Water Logging", count: 40 },
  { name: "Pothole", count: 65 },
  { name: "Tree Fall", count: 15 },
];

const initialSeverityData = [
  { name: "Low", value: 150, color: "#10B981" },     // Emerald 500
  { name: "Medium", value: 95, color: "#F59E0B" },  // Amber 500
  { name: "High", value: 50, color: "#EF4444" },    // Red 500
  { name: "Critical", value: 12, color: "#7F1D1D" } // Red 900
];

export default function StrategicInsights() {
  const navigate = useNavigate();
  
  // Data State
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState([...mockTimeSeries24h]);
  const [typeData, setTypeData] = useState([...mockTypeData24h]);
  const [severityData, setSeverityData] = useState([...initialSeverityData]);
  const [totalReports, setTotalReports] = useState(3240);

  // Filter State
  const [timeFilter, setTimeFilter] = useState("24h");
  const [corridorFilter, setCorridorFilter] = useState("All");

  // Drill-down Modal State
  const [selectedCategory, setSelectedCategory] = useState<{ type: string, name: string } | null>(null);

  // Initial Fetch
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await axios.get(`${API_URL}/incidents`);
        setLiveIncidents(response.data);
      } catch (error) {
        console.error("Error fetching live incidents for insights:", error);
      }
    };
    fetchIncidents();
  }, []);

  // Live Simulation Engine
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live incoming reports
      setTotalReports(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      
      // Slightly mutate the last data point in the area chart to make it "breathe"
      setTimeSeriesData(prev => {
        const newData = [...prev];
        const lastIndex = newData.length - 1;
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        
        newData[lastIndex] = {
          ...newData[lastIndex],
          incidents: Math.max(0, newData[lastIndex].incidents + change)
        };
        return newData;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle Filters
  useEffect(() => {
    // When filters change, we randomize the data heavily to simulate different datasets
    const multiplier = timeFilter === "7d" ? 7 : timeFilter === "30d" ? 30 : 1;
    const corridorFactor = corridorFilter === "All" ? 1 : 0.3; // Specific corridors have less volume
    
    const factor = multiplier * corridorFactor;
    
    let baseTimeData = mockTimeSeries24h;
    if (timeFilter === "7d") baseTimeData = mockTimeSeries7d;
    if (timeFilter === "30d") baseTimeData = mockTimeSeries30d;

    setTimeSeriesData(baseTimeData.map(d => ({
      ...d,
      incidents: Math.floor(d.incidents * corridorFactor * (0.8 + Math.random() * 0.4)),
      resolved: Math.floor(d.resolved * corridorFactor * (0.8 + Math.random() * 0.4))
    })));

    setTypeData(mockTypeData24h.map(d => ({
      ...d,
      count: Math.floor(d.count * factor * (0.8 + Math.random() * 0.4))
    })));

    setSeverityData(initialSeverityData.map(d => ({
      ...d,
      value: Math.floor(d.value * factor * (0.8 + Math.random() * 0.4))
    })));
    
    setTotalReports(Math.floor(3240 * factor));
  }, [timeFilter, corridorFilter]);


  const activeCount = liveIncidents.filter(inc => inc.status === "Active").length;
  const criticalCount = liveIncidents.filter(inc => inc.severity.toLowerCase() === "critical" && inc.status === "Active").length;
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            Strategic Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            City-wide traffic analytics, historical trends, and live operational metrics.
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">Live Active Incidents</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>12% from yesterday</span>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors">Live Critical Alerts</p>
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
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">42m</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>5 mins faster than avg</span>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reports This Period</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 animate-pulse">{totalReports.toLocaleString()}</h3>
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
          </div>
        </div>

        {/* Severity Donut Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Incidents by Severity</h2>
          <div className="h-64 w-full relative">
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
          </div>
          
          {/* Custom Legend */}
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
        </div>

        {/* Causes Bar Chart (Takes up full width below) */}
        <div className="lg:col-span-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Most Common Incident Types</h2>
          <div className="h-72 w-full">
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
              {/* Show matching live incidents if available, else mock data */}
              {liveIncidents.filter(inc => 
                (selectedCategory.type === "Severity" && inc.severity.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                (selectedCategory.type === "Type" && inc.type.toLowerCase().includes(selectedCategory.name.toLowerCase()))
              ).length > 0 ? (
                <div className="space-y-4">
                  {liveIncidents.filter(inc => 
                    (selectedCategory.type === "Severity" && inc.severity.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                    (selectedCategory.type === "Type" && inc.type.toLowerCase().includes(selectedCategory.name.toLowerCase()))
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
                        <p className="text-xs text-gray-400 mt-1">{new Date(inc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No live active incidents match this criteria right now.</p>
                  <p className="text-sm mt-1">This category represents historical aggregated data in the current filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
