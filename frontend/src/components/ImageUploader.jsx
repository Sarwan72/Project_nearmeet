import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, CheckCircle2, Link as LinkIcon, Plus, } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
/**
 * ImageUploader Component
 * Supports direct multi-file upload to Cloudinary via backend (/api/upload/photos)
 * Supports drag-and-drop, preview thumbnails, deletion, and manual URL input fallback.
 *
 * @param {Array<string>} photos - List of current photo URLs
 * @param {Function} onChange - Callback receiving updated photo URLs array: (newPhotos) => void
 * @param {number} maxPhotos - Maximum number of photos allowed (default: 5)
 */
const ImageUploader = ({ photos = [], onChange, maxPhotos = 5 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("file"); // "file" or "url"
    const [manualUrl, setManualUrl] = useState("");
    const fileInputRef = useRef(null);
    const remainingSlots = Math.max(0, maxPhotos - photos.length);
    // Handle file selection
    const handleFiles = async (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0)
            return;
        if (photos.length >= maxPhotos) {
            toast.error(`Maximum limit of ${maxPhotos} photos reached.`);
            return;
        }
        const filesToUpload = Array.from(selectedFiles).slice(0, remainingSlots);
        // Validate size and mime type
        for (const file of filesToUpload) {
            if (!file.type.startsWith("image/")) {
                toast.error(`"${file.name}" is not an image file.`);
                return;
            }
            if (file.size > 6 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds the 6MB limit.`);
                return;
            }
        }
        const formData = new FormData();
        filesToUpload.forEach((file) => {
            formData.append("photos", file);
        });
        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${filesToUpload.length} image(s) to Cloudinary...`);
        try {
            const response = await axiosInstance.post("/upload/photos", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success && response.data.urls?.length > 0) {
                const newUrls = response.data.urls;
                const updated = [...photos, ...newUrls].slice(0, maxPhotos);
                onChange(updated);
                toast.success(`Successfully uploaded ${newUrls.length} photo(s)!`, { id: toastId });
            }
            else {
                toast.error("Upload did not return image URLs", { id: toastId });
            }
        }
        catch (err) {
            console.error("Cloudinary upload error:", err);
            const message = err.response?.data?.message ||
                "Upload failed. Check if Cloudinary credentials are set in backend/.env";
            toast.error(message, { id: toastId, duration: 5000 });
        }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const handleRemovePhoto = (indexToRemove) => {
        const updated = photos.filter((_, idx) => idx !== indexToRemove);
        onChange(updated);
    };
    const handleAddManualUrl = () => {
        const trimmed = manualUrl.trim();
        if (!trimmed)
            return;
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            toast.error("Please enter a valid URL starting with http:// or https://");
            return;
        }
        if (photos.length >= maxPhotos) {
            toast.error(`Maximum limit of ${maxPhotos} photos reached.`);
            return;
        }
        onChange([...photos, trimmed]);
        setManualUrl("");
        toast.success("Photo URL added!");
    };
    return (<div className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-200">
            Venue Photos
          </label>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
            {photos.length} / {maxPhotos}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
          <button type="button" onClick={() => setActiveTab("file")} className={`px-3 py-1 rounded-md transition font-medium ${activeTab === "file"
            ? "bg-amber-500 text-slate-950 shadow"
            : "text-gray-400 hover:text-white"}`}>
            Cloudinary Upload
          </button>
          <button type="button" onClick={() => setActiveTab("url")} className={`px-3 py-1 rounded-md transition font-medium ${activeTab === "url"
            ? "bg-amber-500 text-slate-950 shadow"
            : "text-gray-400 hover:text-white"}`}>
            Add via URL
          </button>
        </div>
      </div>

      {/* Cloudinary File Upload Dropzone */}
      {activeTab === "file" && (<div>
          <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} multiple accept="image/png, image/jpeg, image/jpg, image/webp, image/gif" className="hidden" disabled={isUploading || remainingSlots === 0}/>

          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => {
                if (!isUploading && remainingSlots > 0 && fileInputRef.current) {
                    fileInputRef.current.click();
                }
            }} className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
                : remainingSlots === 0
                    ? "border-white/10 bg-white/5 opacity-60 cursor-not-allowed"
                    : "border-white/20 bg-white/5 hover:border-amber-400/60 hover:bg-white/[0.08]"}`}>
            {isUploading ? (<div className="flex flex-col items-center justify-center py-4 text-amber-300 gap-2">
                <Loader2 className="w-8 h-8 animate-spin"/>
                <p className="text-sm font-medium">Uploading to Cloudinary...</p>
                <p className="text-xs text-gray-400">Optimizing and storing your images</p>
              </div>) : remainingSlots === 0 ? (<div className="flex flex-col items-center justify-center py-2 text-gray-400 gap-1">
                <CheckCircle2 className="w-7 h-7 text-green-400"/>
                <p className="text-sm font-medium text-white">Maximum {maxPhotos} photos reached</p>
                <p className="text-xs">Remove an existing photo to upload a new one</p>
              </div>) : (<div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <UploadCloud className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    <span className="text-amber-400 hover:underline">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, WEBP up to 6MB ({remainingSlots} slot{remainingSlots > 1 ? "s" : ""} left)
                  </p>
                </div>
              </div>)}
          </div>
        </div>)}

      {/* Manual URL Input Fallback */}
      {activeTab === "url" && (<div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="url" placeholder="Paste public image link (e.g. https://images.unsplash.com/...)" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManualUrl();
                }
            }} disabled={remainingSlots === 0} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"/>
          </div>
          <button type="button" onClick={handleAddManualUrl} disabled={!manualUrl.trim() || remainingSlots === 0} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm transition flex items-center gap-1.5">
            <Plus className="w-4 h-4"/>
            Add
          </button>
        </div>)}

      {/* Photo Gallery Grid */}
      {photos.length > 0 && (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {photos.map((url, idx) => (<div key={idx} className="group relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-md transition-all hover:border-amber-400/50">
              <img src={url} alt={`Venue photo ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => {
                    e.target.src =
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80";
                }}/>

              {/* Primary Photo Badge */}
              {idx === 0 && (<span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded shadow">
                  Cover
                </span>)}

              {/* Delete Button */}
              <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                }} className="absolute top-1.5 right-1.5 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow" title="Remove photo">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>))}
        </div>)}
    </div>);
};
export default ImageUploader;
