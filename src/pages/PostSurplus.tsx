import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, MapPin, Clock, Users, Thermometer } from 'lucide-react';
import FreshFoodChecker from '../components/FreshFoodChecker';
import { foodApi } from '../services/api';

interface PostSurplusPageProps {
  darkMode: boolean;
  onBack: () => void;
}

interface FoodAssessment {
  qualityScore: number;
  freshness: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'approved' | 'rejected';
}

interface FormData {
  foodName: string;
  foodType: string;
  quantity: number;
  location: string;
  address: string;
  safetyWindow: number;
  minTemp: number | null;
  maxTemp: number | null;
  availabilityHours: number | null;
  description: string;
  assessment: FoodAssessment | null;
}

const PostSurplusPage: React.FC<PostSurplusPageProps> = ({ darkMode, onBack }) => {
  const [step, setStep] = useState<'check' | 'form' | 'review' | 'success'>('check');
  const [posting, setPosting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postedId, setPostedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    foodName: '',
    foodType: 'meals',
    quantity: 0,
    location: '',
    address: '',
    safetyWindow: 30,
    minTemp: null,
    maxTemp: null,
    availabilityHours: null,
    description: '',
    assessment: null,
  });

  // Default temperature ranges by food type (°C)
  const getDefaultTempRange = (foodType: string): { min: number; max: number } => {
    const ranges: Record<string, { min: number; max: number }> = {
      meals: { min: 60, max: 4 }, // Hot meals: 60°C+ or refrigerated at 4°C
      vegetables: { min: 0, max: 10 },
      fruits: { min: 0, max: 10 },
      baked: { min: 18, max: 25 },
      dairy: { min: 0, max: 4 },
      others: { min: 0, max: 10 },
    };
    return ranges[foodType] || ranges.others;
  };

  const handleFreshFoodPass = (assessment: FoodAssessment) => {
    setFormData(prev => {
      const defaults = getDefaultTempRange(prev.foodType);
      return {
        ...prev,
        assessment,
        minTemp: prev.minTemp ?? defaults.min,
        maxTemp: prev.maxTemp ?? defaults.max,
      };
    });
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'safetyWindow' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleConfirmPost = async () => {
    setSubmitError(null);
    setPosting(true);
    try {
      const payload = {
        food_name: formData.foodName,
        food_type: formData.foodType,
        quantity_servings: formData.quantity,
        description: formData.description || undefined,
        address: formData.address,
        safety_window_minutes: formData.safetyWindow,
        min_storage_temp_celsius: formData.minTemp ?? undefined,
        max_storage_temp_celsius: formData.maxTemp ?? undefined,
        availability_time_hours: formData.availabilityHours ?? undefined,
      };
      const { data } = await foodApi.postFood(payload);
      setPostedId(data?.id ?? null);
      setStep('success');
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      setSubmitError(message || 'Failed to post food. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleNewPost = () => {
    setFormData({
      foodName: '',
      foodType: 'meals',
      quantity: 0,
      location: '',
      address: '',
      safetyWindow: 30,
      minTemp: null,
      maxTemp: null,
      availabilityHours: null,
      description: '',
      assessment: null,
    });
    setPostedId(null);
    setSubmitError(null);
    setStep('check');
  };

  const handleFoodTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const defaultRange = getDefaultTempRange(newType);
    setFormData(prev => ({
      ...prev,
      foodType: newType,
      minTemp: prev.minTemp === null ? defaultRange.min : prev.minTemp,
      maxTemp: prev.maxTemp === null ? defaultRange.max : prev.maxTemp,
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-emerald-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg transition-all duration-300 ${
        darkMode
          ? 'bg-gradient-to-r from-emerald-950/95 to-blue-950/95 border-b border-emerald-700/40'
          : 'bg-gradient-to-r from-white/95 to-gray-50/95 border-b border-gray-200/50'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                darkMode
                  ? 'bg-emerald-900/60 text-gray-300 hover:bg-emerald-800/60'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Post Surplus Food</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['Fresh Check', 'Details', 'Review', 'Success'].map((label, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  step === ['check', 'form', 'review', 'success'][idx]
                    ? darkMode
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-600 text-white'
                    : ['check', 'form', 'review', 'success'].indexOf(step) > idx
                      ? 'bg-green-600 text-white'
                      : darkMode
                        ? 'bg-emerald-900/50 text-gray-400'
                        : 'bg-gray-300 text-gray-600'
                }`}>
                  {['check', 'form', 'review', 'success'].indexOf(step) > idx ? '✓' : idx + 1}
                </div>
                <p className={`text-xs font-semibold mt-1 text-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {label}
                </p>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-1 ${
                  ['check', 'form', 'review', 'success'].indexOf(step) > idx
                    ? 'bg-green-600'
                    : darkMode
                      ? 'bg-emerald-900/50'
                      : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Fresh Food Checker */}
        {step === 'check' && (
          <div className="max-w-2xl mx-auto">
            <FreshFoodChecker
              darkMode={darkMode}
              onPass={handleFreshFoodPass}
              onFail={() => {
                // Reset and show error
                setFormData(prev => ({ ...prev, assessment: null }));
              }}
            />
          </div>
        )}

        {/* Step 2: Food Details Form */}
        {step === 'form' && formData.assessment && (
          <form onSubmit={handleSubmit} className={`rounded-lg p-6 ${
            darkMode ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/40 border border-emerald-600/25' : 'bg-white shadow-md'
          }`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
              darkMode ? 'text-teal-400' : 'text-teal-600'
            }`}>
              <CheckCircle className="w-5 h-5" />
              Quality Check Passed! Now Add Details
            </h2>

            {/* Quality Badge */}
            <div className={`mb-6 p-4 rounded-lg border ${
              darkMode
                ? 'bg-green-900/20 border-green-700/50'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Quality Score
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {formData.assessment.qualityScore}% - {formData.assessment.freshness.toUpperCase()}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Food Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Food Name *
                </label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="e.g., Biryani, Dosa, Rice"
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                  } focus:outline-none`}
                />
              </div>

              {/* Food Type */}
              <div>
                <label
                  htmlFor="post-food-type"
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Food Type *
                </label>
                <select
                  id="post-food-type"
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleFoodTypeChange}
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                  } focus:outline-none`}
                >
                  <option value="meals">Cooked Meals</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="baked">Baked Goods</option>
                  <option value="dairy">Dairy</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity (Servings) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Number of servings"
                    min="1"
                    required
                    className={`flex-1 px-4 py-2 rounded-lg border transition ${
                      darkMode
                        ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                    } focus:outline-none`}
                  />
                  <Users className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              </div>

              {/* Safety Window */}
              <div>
                <label
                  htmlFor="post-safety-window"
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Safety Window (Minutes) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="post-safety-window"
                    type="number"
                    name="safetyWindow"
                    value={formData.safetyWindow}
                    onChange={handleInputChange}
                    min="15"
                    max="120"
                    required
                    className={`flex-1 px-4 py-2 rounded-lg border transition ${
                      darkMode
                        ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                    } focus:outline-none`}
                  />
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              </div>

              {/* Temperature Range */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Storage Temperature Range (°C) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minTemp"
                      value={formData.minTemp ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, minTemp: e.target.value ? parseFloat(e.target.value) : null }))}
                      placeholder="Min temp"
                      step="0.5"
                      min="-20"
                      max="100"
                      required
                      className={`flex-1 px-4 py-2 rounded-lg border transition ${
                        darkMode
                          ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                      } focus:outline-none`}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="maxTemp"
                      value={formData.maxTemp ?? ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTemp: e.target.value ? parseFloat(e.target.value) : null }))}
                      placeholder="Max temp"
                      step="0.5"
                      min="-20"
                      max="100"
                      required
                      className={`flex-1 px-4 py-2 rounded-lg border transition ${
                        darkMode
                          ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                      } focus:outline-none`}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max</span>
                  </div>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Recommended: {getDefaultTempRange(formData.foodType).min}°C to {getDefaultTempRange(formData.foodType).max}°C for {formData.foodType}
                </p>
              </div>

              {/* Availability Time */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Available For (Hours)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="availabilityHours"
                    value={formData.availabilityHours ?? ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, availabilityHours: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="e.g., 24"
                    min="1"
                    max="168"
                    className={`flex-1 px-4 py-2 rounded-lg border transition ${
                      darkMode
                        ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                    } focus:outline-none`}
                  />
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  How long this food will remain available
                </p>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location Name *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Chennai, Bangalore"
                    required
                    className={`flex-1 px-4 py-2 rounded-lg border transition ${
                      darkMode
                        ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                    } focus:outline-none`}
                  />
                  <MapPin className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete pickup address"
                  rows={3}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                  } focus:outline-none`}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Additional Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or details about the food"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border transition ${
                    darkMode
                      ? 'bg-emerald-900/50 border-emerald-600/40 text-white focus:border-emerald-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                  } focus:outline-none`}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('check')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  darkMode
                    ? 'bg-emerald-900/50 text-gray-300 hover:bg-emerald-800/50'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ← Back to Fresh Check
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition bg-teal-600 hover:bg-teal-700`}
              >
                Continue to Review →
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Review */}
        {step === 'review' && formData.assessment && (
          <div className={`rounded-lg p-6 ${
            darkMode ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/40 border border-emerald-600/25' : 'bg-white shadow-md'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Review Your Post
            </h2>

            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-lg border ${
                darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Food Name</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.foodName} ({formData.foodType})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${
                  darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quantity</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formData.quantity} servings
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Safety Window</p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formData.safetyWindow} mins
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Thermometer className="w-3 h-3" /> Temperature Range
                  </p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formData.minTemp !== null && formData.maxTemp !== null
                      ? `${formData.minTemp}°C - ${formData.maxTemp}°C`
                      : 'Not specified'}
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock className="w-3 h-3" /> Available For
                  </p>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formData.availabilityHours !== null
                      ? `${formData.availabilityHours} hours`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                darkMode
                ? 'bg-emerald-900/40 border-emerald-600/30'
                : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.location}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quality Score</p>
                <p className={`font-semibold text-lg ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  ✓ {formData.assessment.qualityScore}% - {formData.assessment.freshness.toUpperCase()}
                </p>
              </div>
            </div>

            {submitError && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                darkMode ? 'bg-red-900/30 border border-red-700/50 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('form'); setSubmitError(null); }}
                disabled={posting}
                className={`flex-1 py-3 rounded-lg font-semibold transition disabled:opacity-50 ${
                  darkMode
                    ? 'bg-emerald-900/50 text-gray-300 hover:bg-emerald-800/50'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ← Edit Details
              </button>
              <button
                type="button"
                onClick={handleConfirmPost}
                disabled={posting}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 bg-green-600 hover:bg-green-700`}
              >
                {posting ? 'Posting…' : '✓ Confirm & Post'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className={`rounded-lg p-8 text-center ${
            darkMode ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/40 border border-emerald-600/25' : 'bg-white shadow-md'
          }`}>
            <div className="mb-4 flex justify-center">
              <div className="animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Food Posted Successfully!
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your surplus food has been posted and is now available for NGOs to request.
              Matched NGOs will be notified shortly.
            </p>

            <div className={`p-4 rounded-lg mb-6 ${
              darkMode
                ? 'bg-teal-900/20 border border-teal-700/50'
                : 'bg-teal-50 border border-teal-200'
            }`}>
              <p className={`font-semibold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                Post ID: #{postedId ?? `RQ${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${
                  darkMode
                    ? 'bg-emerald-900/50 text-gray-300 hover:bg-emerald-800/50'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleNewPost}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition bg-teal-600 hover:bg-teal-700`}
              >
                Post Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostSurplusPage;
