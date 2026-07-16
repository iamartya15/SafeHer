import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import * as incidentService from '../services/incidentService';
import InteractiveMap from '../components/InteractiveMap';
import {
  AlertTriangle,
  Upload,
  MapPin,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ReportIncident = () => {
  const navigate = useNavigate();
  const { latitude: currentLat, longitude: currentLng, loading: geoLoading } = useGeolocation();

  const [selectedCoords, setSelectedCoords] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      category: 'Harassment',
      description: '',
      latitude: '',
      longitude: '',
      address: ''
    }
  });

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data && data.display_name) {
        // Strip long addresses for readability
        const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
        setValue('address', shortAddress);
      } else {
        setValue('address', `Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (err) {
      setValue('address', `Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, [setValue]);

  // Sync user location on fetch
  useEffect(() => {
    if (currentLat && currentLng) {
      const coords = { latitude: currentLat, longitude: currentLng };
      setSelectedCoords(coords);
      setValue('latitude', currentLat.toString());
      setValue('longitude', currentLng.toString());
      
      // Try to reverse geocode coordinate address (mocked or OSM Nominatim lookup)
      reverseGeocode(currentLat, currentLng);
    }
  }, [currentLat, currentLng, setValue, reverseGeocode]);



  const handleMapClick = (coords) => {
    setSelectedCoords(coords);
    setValue('latitude', coords.latitude.toString());
    setValue('longitude', coords.longitude.toString());
    reverseGeocode(coords.latitude, coords.longitude);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!data.latitude || !data.longitude) {
      toast.error('Location coordinates are required.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting incident report to network...');
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      formData.append('address', data.address);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await incidentService.createIncident(formData);
      if (res.success) {
        toast.success('Incident reported. Thank you for keeping the community safe.', { id: toastId });
        navigate('/map');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit report.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Report Safety Incident
        </h1>
        <p className="text-slate-400 text-xs mt-1">Submit reports anonymously or with your handle. Updates appear on the community map immediately.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Column */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6 h-fit">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-wide">Incident Information</h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Incident Category</label>
              <select
                className="glass-input text-xs"
                {...register('category', { required: true })}
              >
                <option value="Harassment">Harassment</option>
                <option value="Theft">Theft</option>
                <option value="Stalking">Stalking</option>
                <option value="Poor Lighting">Poor Lighting</option>
                <option value="Unsafe Area">Unsafe Area</option>
                <option value="Road Issue">Road Issue</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Please describe what happened, crowd conditions, or hazard levels..."
                className={`glass-input text-xs ${errors.description ? 'border-red-500/50' : ''}`}
                {...register('description', { required: 'Please provide description details' })}
              />
              {errors.description && (
                <span className="text-[10px] text-red-400 block">{errors.description.message}</span>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Geographic Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Fetching address details..."
                  className="glass-input pl-10 text-xs"
                  {...register('address', { required: 'Location address is required' })}
                />
              </div>
            </div>

            {/* Coordinate display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                <input
                  type="text"
                  readOnly
                  className="glass-input bg-slate-900/80 font-mono text-xs cursor-default"
                  {...register('latitude')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                <input
                  type="text"
                  readOnly
                  className="glass-input bg-slate-900/80 font-mono text-xs cursor-default"
                  {...register('longitude')}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Incident Image (Optional)</label>
              <div className="flex gap-4 items-center">
                
                {/* Upload Button */}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/50 rounded-lg cursor-pointer transition-colors text-xs font-semibold">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Incident preview" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-6 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Incident Details...</span>
                </>
              ) : (
                <span>Submit Safety Report</span>
              )}
            </button>
          </form>
        </div>

        {/* Map Column */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Adjust Incident Pin on Map</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              If your current location doesn't match the hazard coordinates, click directly on the map below to position the pin exactly.
            </p>
          </div>

          <div className="flex-grow min-h-[400px]">
            {geoLoading ? (
              <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-900/50 border border-white/5 rounded-xl text-slate-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mr-1.5" /> Synchronizing GPS satellites...
              </div>
            ) : (
              <InteractiveMap
                userLocation={
                  currentLat && currentLng ? { latitude: currentLat, longitude: currentLng } : null
                }
                selectedLocation={selectedCoords}
                onMapClick={handleMapClick}
                zoom={14}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default ReportIncident;
