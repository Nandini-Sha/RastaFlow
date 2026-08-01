import { useState, useRef } from "react";
import axios from "axios";
import { Camera, MapPin, AlertTriangle, Send, CheckCircle, UploadCloud, X, Edit3 } from "lucide-react";

export default function IncidentPortal() {
  const [formData, setFormData] = useState({
    type: "",
    customType: "",
    location: "",
    customLocation: "",
    description: "",
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incidentTypes = [
    "Vehicle Breakdown", "Tree Fall", "Accident", "Public Event",
    "Water Logging", "Pot Holes", "Congestion", "Construction",
    "Road Conditions", "VIP Movement", "Procession", "Protest",
    "Debris", "Fog / Low Visibility", "Test Demo", "Other"
  ];

  const locations = [
    "Airport New South Road", "Bannerghata Road", "Bellary Road 1", "Bellary Road 2",
    "CBD 1", "CBD 2", "Hennur Main Road", "Hosur Road", "IRR(Thanisandra road)",
    "Magadi Road", "Mysore Road", "Non-corridor", "ORR East 1", "ORR East 2",
    "ORR North 1", "ORR North 2", "ORR West 1", "Old Airport Road", "Old Madras Road",
    "Tumkur Road", "Varthur Road", "West of Chord Road", "Other"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalType = formData.type === "Other" ? formData.customType : formData.type;
      const finalLocation = formData.location === "Other" ? formData.customLocation : formData.location;

      const data = new FormData();
      data.append("type", finalType);
      data.append("location", finalLocation);
      data.append("description", formData.description);
      if (image) {
        data.append("image", image);
      }

      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
      await axios.post(`${API_URL}/report-incident`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsSuccess(true);
      // Reset form
      setFormData({ type: "", customType: "", location: "", customLocation: "", description: "" });
      setImage(null);
      setPreviewUrl(null);
      
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Camera className="w-8 h-8 text-blue-500" />
          Citizen Reporting Portal
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Help keep our roads safe by reporting traffic incidents in real-time.
        </p>
      </div>

      {isSuccess && (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Report Submitted Successfully!</h3>
            <p className="text-sm">Thank you for keeping the community safe. Our command center is reviewing it.</p>
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Incident Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Incident Type
                </label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    required
                  >
                    <option value="" disabled>Select Incident Type</option>
                    {incidentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Conditional Other Input for Type */}
                {formData.type === "Other" && (
                  <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Edit3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Please specify the incident type"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      required={formData.type === "Other"}
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    required
                  >
                    <option value="" disabled>Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Other Input for Location */}
                {formData.location === "Other" && (
                  <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Edit3 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Please specify the location"
                      value={formData.customLocation}
                      onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                      required={formData.location === "Other"}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Provide any additional details..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  required
                ></textarea>
              </div>
            </div>

            {/* Right Column (Image Upload) */}
            <div className="flex flex-col h-full">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Photo Evidence (Optional)
              </label>
              
              <div className="flex-1 relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center min-h-[200px] overflow-hidden group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <p className="text-white font-medium flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Change Photo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 pointer-events-none">
                    <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG up to 5MB
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2 font-medium bg-yellow-50 dark:bg-yellow-900/20 py-1 px-2 rounded-md inline-block">
                      Note: Please upload a landscape image or tilt your camera to click image.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-8 py-3.5 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all ${
                isSubmitting 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
