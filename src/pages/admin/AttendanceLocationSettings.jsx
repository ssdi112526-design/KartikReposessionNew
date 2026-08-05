import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services';

function mapsUrl(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export default function AttendanceLocationSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationId, setLocationId] = useState(null);
  const [gpsMeta, setGpsMeta] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: 'Kartik Repossession Office',
      latitude: '',
      longitude: '',
      radiusMeters: 500,
      maxAccuracy: 100,
      lateAfterTime: '09:30',
      isActive: true,
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const previewUrl = mapsUrl(latNum, lngNum);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await attendanceService.getLocation();
        const loc = res.data.data.location;
        if (loc) {
          setLocationId(loc._id || loc.id);
          reset({
            name: loc.name || '',
            latitude: loc.latitude ?? '',
            longitude: loc.longitude ?? '',
            radiusMeters: loc.radiusMeters ?? 500,
            maxAccuracy: loc.maxAccuracy ?? 100,
            lateAfterTime: loc.lateAfterTime || '09:30',
            isActive: loc.isActive !== false,
          });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load location');
      } finally {
        setLoading(false);
      }
    })();
  }, [reset, toast]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device');
      return;
    }
    if (!window.isSecureContext) {
      toast.error('Location needs HTTPS. Open the admin panel with https:// and try again.');
      return;
    }

    setLocating(true);
    setGpsMeta(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        // reset() reliably updates registered number inputs (setValue often fails to refresh them)
        reset({
          ...getValues(),
          latitude: lat,
          longitude: lng,
        });

        setGpsMeta({
          latitude: lat,
          longitude: lng,
          accuracy,
        });

        toast.success(
          Number.isFinite(accuracy)
            ? `Coordinates set (±${Math.round(accuracy)} m accuracy). Verify on the map below.`
            : 'Coordinates set from your current location. Verify on the map below.'
        );
        setLocating(false);
      },
      (err) => {
        const msg =
          err?.code === err?.PERMISSION_DENIED
            ? 'Location permission denied. Allow location access in the browser and try again.'
            : 'Unable to get current location. Check GPS/Wi‑Fi and try again.';
        toast.error(msg);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0, // never use cached / stale coordinates
      }
    );
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...(locationId ? { id: locationId } : {}),
        name: data.name,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        radiusMeters: Number(data.radiusMeters),
        maxAccuracy: Number(data.maxAccuracy),
        lateAfterTime: data.lateAfterTime || '09:30',
        isActive: data.isActive === true || data.isActive === 'true',
      };

      if (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) {
        toast.error('Latitude looks invalid');
        return;
      }
      if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) {
        toast.error('Longitude looks invalid');
        return;
      }

      const res = await attendanceService.saveLocation(payload);
      const loc = res.data.data.location;
      setLocationId(loc._id || loc.id);
      reset({
        name: loc.name || payload.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        radiusMeters: loc.radiusMeters,
        maxAccuracy: loc.maxAccuracy,
        lateAfterTime: loc.lateAfterTime || payload.lateAfterTime,
        isActive: loc.isActive !== false,
      });
      toast.success('Attendance location saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save location');
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink">Attendance Location</h1>
      <p className="mt-1 text-sm text-muted">
        Configure office GPS, allowed radius, and late cutoff time. Staff can mark attendance only
        within this geofence.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        noValidate
      >
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Location Name *</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            {...register('name', { required: 'Location name is required' })}
          />
          {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Latitude *</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('latitude', {
                required: 'Latitude is required',
                valueAsNumber: true,
                validate: (v) =>
                  (Number.isFinite(v) && v >= -90 && v <= 90) || 'Latitude must be between -90 and 90',
              })}
            />
            {errors.latitude && (
              <span className="mt-1 block text-xs text-red-500">{errors.latitude.message}</span>
            )}
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Longitude *</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('longitude', {
                required: 'Longitude is required',
                valueAsNumber: true,
                validate: (v) =>
                  (Number.isFinite(v) && v >= -180 && v <= 180) ||
                  'Longitude must be between -180 and 180',
              })}
            />
            {errors.longitude && (
              <span className="mt-1 block text-xs text-red-500">{errors.longitude.message}</span>
            )}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating}>
            {locating ? 'Detecting location...' : 'Use my current location'}
          </Button>
          {gpsMeta?.accuracy != null && (
            <span className="text-xs text-muted">GPS accuracy: ±{Math.round(gpsMeta.accuracy)} m</span>
          )}
        </div>

        {previewUrl && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-ink">Map preview</p>
            <p className="mt-1 break-all text-xs text-muted">
              Lat {latNum}, Lng {lngNum}
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-brand underline"
            >
              Open in Google Maps to verify pin
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Allowed Radius (meters) *</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('radiusMeters', {
                required: 'Radius is required',
                valueAsNumber: true,
                min: 1,
              })}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Max GPS Accuracy (meters)</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('maxAccuracy', { valueAsNumber: true, min: 1 })}
            />
            <span className="mt-1 block text-xs text-muted">
              Reject scans when device accuracy is worse than this value.
            </span>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Late After Time (IST) *</span>
          <input
            type="time"
            className="w-full max-w-xs rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            {...register('lateAfterTime', {
              required: 'Late after time is required',
              pattern: {
                value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                message: 'Use HH:MM format',
              },
            })}
          />
          <span className="mt-1 block text-xs text-muted">
            Check-in at or after this time is marked Late. Example: 09:30 means 9:30 AM onwards = Late.
          </span>
          {errors.lateAfterTime && (
            <span className="mt-1 block text-xs text-red-500">{errors.lateAfterTime.message}</span>
          )}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isActive')} className="rounded border-slate-300" />
          Active
        </label>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Location'}
        </Button>
      </form>
    </div>
  );
}
