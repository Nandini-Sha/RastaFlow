import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, Clock, MapPin, CheckCircle, Activity, ChevronRight, FileText, X, Trash2, Filter } from "lucide-react";

export default function IncidentManagement() {
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [historicalIncidents, setHistoricalIncidents] = useState<any[]>([]);
  const [isOfficial, setIsOfficial] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [currentFilter, setCurrentFilter] = useState<string>("All");

  const fetchIncidents = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
      const response = await axios.get(`${API_URL}/incidents`);
      const data = response.data;
      setActiveIncidents(data.filter((inc: any) => inc.status === "Active"));
      setHistoricalIncidents(data.filter((inc: any) => inc.status === "Resolved"));
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  useEffect(() => {
    // Check if user is an official
    setIsOfficial(localStorage.getItem("isOfficial") === "true");
    fetchIncidents();
    
    // Check if navigated with a filter
    if (location.state?.severityFilter) {
      setCurrentFilter(location.state.severityFilter);
      // clear state so refresh doesn't stick
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't trigger the card click!
    if (!window.confirm("Are you sure you want to permanently delete this incident?")) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
      await axios.delete(`${API_URL}/incidents/${id}`);
      fetchIncidents(); // Refresh the lists
    } catch (error) {
      console.error("Error deleting incident:", error);
      alert("Failed to delete incident.");
    }
  };

  const handleResolve = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't trigger the card click!
    if (!window.confirm("Mark this incident as resolved?")) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
      await axios.patch(`${API_URL}/incidents/${id}/resolve`);
      fetchIncidents(); // Refresh the lists
    } catch (error) {
      console.error("Error resolving incident:", error);
      alert("Failed to resolve incident.");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const handleIncidentClick = (incident: any) => {
    if (!isOfficial) return;
    
    // Navigate to predict page with pre-filled state
    navigate("/predict", { 
      state: { 
        incident: {
          event_type: "unplanned",
          event_cause: incident.type, // Map the type to cause
          corridor: incident.location,
          veh_type: "others", // Default since we don't capture this in citizen report
          requires_road_closure: incident.severity.toLowerCase() === "critical",
          image_url: incident.image_url // Pass the image url for the Operations Center!
        },
        autoSubmit: true
      } 
    });
  };

  return (
    <>
      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setFullScreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setFullScreenImage(null);
            }}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={fullScreenImage} 
            alt="Full screen incident" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6 md:space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-yellow-500" />
              Live Traffic Command
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Monitor and manage active and historical traffic incidents across all corridors.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 flex-1">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Critical</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeIncidents.filter(inc => inc.severity.toLowerCase() === 'critical').length}</p>
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 flex-1">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeIncidents.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Incidents Panel */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Active Incidents
                <div className="ml-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select 
                    value={currentFilter}
                    onChange={(e) => setCurrentFilter(e.target.value)}
                    className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 border-none focus:ring-0 cursor-pointer p-0 pr-6 appearance-none outline-none"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {activeIncidents
                .filter(inc => currentFilter === "All" || inc.severity.toLowerCase() === currentFilter.toLowerCase())
                .map((incident) => (
                <div 
                  key={incident.id}
                  onClick={() => handleIncidentClick(incident)}
                  className={`group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 relative ${isOfficial ? 'hover:shadow-md hover:border-yellow-300 dark:hover:border-yellow-600/50 cursor-pointer' : ''}`}
                >
                  {/* Mobile Header */}
                  <div className="flex md:hidden flex-col gap-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        {incident.image_url && !isOfficial && (
                          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                            Photo
                          </span>
                        )}
                        {isOfficial && (
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => handleResolve(e, incident.id)}
                              className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors bg-gray-100 dark:bg-gray-700"
                              title="Mark as Resolved"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, incident.id)}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors bg-gray-100 dark:bg-gray-700"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono font-semibold text-gray-500 dark:text-gray-400">{incident.incident_id || incident.id}</span>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" /> {incident.time}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden md:flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-gray-500 dark:text-gray-400">{incident.incident_id || incident.id}</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      {incident.image_url && !isOfficial && (
                        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                          Photo Attached
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <Clock className="w-4 h-4 mr-1" /> {incident.time}
                      </div>
                      {isOfficial && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleResolve(e, incident.id)}
                            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, incident.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete Incident"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors pr-8">
                    {incident.type}
                  </h3>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                      {incident.location}
                    </div>
                    {isOfficial && (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Predict Impact <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* ONLY SHOW FULL DETAILS TO OFFICIALS */}
                  {isOfficial && (incident.description || incident.image_url) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 space-y-4">
                      {incident.description && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <FileText className="w-4 h-4 mt-0.5 text-gray-400" />
                          <p>{incident.description}</p>
                        </div>
                      )}
                      {incident.image_url && (
                        <div 
                          className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation(); // Don't trigger the predict navigation!
                            setFullScreenImage(incident.image_url);
                          }}
                        >
                          <img 
                            src={incident.image_url} 
                            alt="Incident Report" 
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Incidents Panel */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Recently Resolved
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {historicalIncidents.map((incident) => (
                <div 
                  key={incident.id}
                  className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 relative"
                >
                  {/* Mobile Header */}
                  <div className="flex md:hidden flex-col gap-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getSeverityColor(incident.severity)} opacity-80`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      {isOfficial && (
                        <button 
                          onClick={(e) => handleDelete(e, incident.id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors bg-gray-100 dark:bg-gray-700"
                          title="Delete Incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-mono font-semibold text-gray-500 dark:text-gray-400">{incident.incident_id || incident.id}</span>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" /> {incident.time}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden md:flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-gray-500 dark:text-gray-400">{incident.incident_id || incident.id}</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getSeverityColor(incident.severity)} opacity-80`}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        {incident.time}
                      </div>
                      {isOfficial && (
                        <button 
                          onClick={(e) => handleDelete(e, incident.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 pr-8">
                    {incident.type}
                  </h3>
                  
                  <div className="mt-2 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {incident.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
