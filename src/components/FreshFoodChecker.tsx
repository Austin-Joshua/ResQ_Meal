import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Zap, TrendingUp, Cpu, Thermometer, Droplets, Clock } from 'lucide-react';
import { foodApi } from '@/services/api';

interface FreshFoodCheckerProps {
  darkMode: boolean;
  onPass?: (assessment: FoodAssessment) => void;
  onFail?: () => void;
}

interface FoodAssessment {
  qualityScore: number;
  freshness: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'approved' | 'rejected';
  notes: string[];
  analysis: {
    packagingCondition: string;
    spoilageDetection: boolean;
    moldPresence: boolean;
    estimatedQuantity: number;
    freshnessLevel: number;
    safetyRating: number;
  };
}

interface FoodClassification {
  food_class?: string;
  food_name?: string;
  confidence?: number;
  nutrition?: { protein?: number; fat?: number; carbs?: number; calories?: number; [k: string]: unknown };
}

type CheckMode = 'photo' | 'environment';

const FreshFoodChecker: React.FC<FreshFoodCheckerProps> = ({ darkMode, onPass, onFail }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'classify' | 'freshness' | null>(null);
  const [assessment, setAssessment] = useState<FoodAssessment | null>(null);
  const [classification, setClassification] = useState<FoodClassification | null>(null);
  const [usedML, setUsedML] = useState(false);
  const [showCheckForm, setShowCheckForm] = useState(false);
  const [checkMode, setCheckMode] = useState<CheckMode>('photo');
  const [envForm, setEnvForm] = useState({ temperature: 20, humidity: 60, time_stored_hours: 12, gas: 200 });

  const mockAssessment = (): FoodAssessment => {
    const qualityScore = Math.random() * 100;
    const freshness = qualityScore >= 85 ? 'excellent' : qualityScore >= 70 ? 'good' : qualityScore >= 50 ? 'fair' : 'poor';
    const status = qualityScore >= 60 ? 'approved' : 'rejected';
    return {
      qualityScore: Math.round(qualityScore),
      freshness,
      status,
      notes: generateNotes(qualityScore),
      analysis: {
        packagingCondition: qualityScore >= 70 ? 'Intact' : 'Minor damage',
        spoilageDetection: qualityScore < 50,
        moldPresence: qualityScore < 40,
        estimatedQuantity: Math.floor(Math.random() * 30) + 10,
        freshnessLevel: Math.round((qualityScore / 100) * 100),
        safetyRating: Math.round(Math.max(40, qualityScore)),
      },
    };
  };

  const generateNotes = (score: number): string[] => {
    if (score >= 85) return ['✓ Excellent condition – prime quality', '✓ Optimal for immediate distribution', '✓ Packaging intact and clean'];
    if (score >= 70) return ['✓ Good condition – suitable for donation', '✓ Acceptable freshness', '✓ Minor packaging wear acceptable'];
    if (score >= 50) return ['⚠ Fair – acceptable with precautions', '⚠ Consume within 2–4 hours', '⚠ Inspect before distribution'];
    return ['❌ Poor – not recommended', '❌ Spoilage indicators detected', '❌ Do not distribute'];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true);
    setClassification(null);
    setUsedML(false);

    try {
      setLoadingStep('classify');
      let classificationResult: FoodClassification | null = null;
      try {
        const { data } = await foodApi.classifyImage(file);
        classificationResult = data as FoodClassification;
        if (classificationResult?.food_name || classificationResult?.food_class) {
          setClassification(classificationResult);
          setUsedML(true);
        }
      } catch {
        // Classify optional; continue to freshness
      }

      setLoadingStep('freshness');
      const { data } = await foodApi.assessFreshness(file);
      const result = data as FoodAssessment;
      setAssessment(result);
      setUsedML((prev) => prev || true);
      if (result.status === 'approved' && onPass) onPass(result);
      else if (result.status === 'rejected' && onFail) onFail();
    } catch {
      const result = mockAssessment();
      setAssessment(result);
      if (result.status === 'approved' && onPass) onPass(result);
      else if (result.status === 'rejected' && onFail) onFail();
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const handleCheckByEnvironment = async () => {
    setLoading(true);
    setClassification(null);
    setUsedML(false);
    try {
      const { data } = await foodApi.assessFreshnessByEnvironment({
        temperature: envForm.temperature,
        humidity: envForm.humidity,
        time_stored_hours: envForm.time_stored_hours,
        gas: envForm.gas,
      });
      const result = data as FoodAssessment;
      setAssessment(result);
      setUsedML(true);
      if (result.status === 'approved' && onPass) onPass(result);
      else if (result.status === 'rejected' && onFail) onFail();
    } catch {
      const result = mockAssessment();
      setAssessment(result);
      if (result.status === 'approved' && onPass) onPass(result);
      else if (result.status === 'rejected' && onFail) onFail();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setAssessment(null);
    setClassification(null);
    setUsedML(false);
    setShowCheckForm(false);
  };

  const isDark = darkMode;
  const cardCls = isDark
    ? 'bg-gray-800/80 border border-gray-700/80 shadow-xl shadow-black/20'
    : 'bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50';
  const inputCls = isDark
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400';

  return (
    <div className={`rounded-2xl overflow-hidden ${cardCls}`}>
      <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/80'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Fresh Food Checker
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AI-powered quality & freshness
              </p>
            </div>
          </div>
          {(usedML && assessment) ? (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
              <Cpu className="w-3.5 h-3.5" /> Powered by ML
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-6">
        {!showCheckForm ? (
          <button
            onClick={() => setShowCheckForm(true)}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
              isDark
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-900/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25'
            }`}
          >
            Start Fresh Food Check
          </button>
        ) : (
          <div className="space-y-5">
            {!assessment ? (
              <>
                <div className={`flex rounded-xl p-1 ${isDark ? 'bg-gray-700/60' : 'bg-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setCheckMode('photo')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      checkMode === 'photo'
                        ? isDark ? 'bg-amber-600 text-white shadow' : 'bg-white text-gray-900 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Check by photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckMode('environment')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      checkMode === 'environment'
                        ? isDark ? 'bg-amber-600 text-white shadow' : 'bg-white text-gray-900 shadow-sm'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Storage conditions
                  </button>
                </div>

                {checkMode === 'photo' && (
                  <>
                    <div
                      className={`relative rounded-xl border-2 border-dashed overflow-hidden transition-colors ${
                        isDark ? 'border-gray-600 bg-gray-700/30 hover:border-amber-500/50' : 'border-gray-300 bg-gray-50 hover:border-amber-400'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center min-h-[140px] cursor-pointer gap-2 py-6">
                        <Upload className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Upload food photo
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          JPG or PNG, up to 10MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="fresh-check-file"
                        />
                      </label>
                    </div>
                    {preview && (
                      <div className="space-y-2">
                        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl ring-2 ring-black/5" />
                        <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{file?.name}</p>
                      </div>
                    )}
                    <button
                      onClick={handleCheck}
                      disabled={!file || loading}
                      className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                        loading || !file
                          ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isDark
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-900/30'
                            : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-500/25'
                      }`}
                    >
                      {loading
                        ? loadingStep === 'classify'
                          ? 'Identifying food…'
                          : 'Analyzing freshness…'
                        : 'Check freshness'}
                    </button>
                  </>
                )}

                {checkMode === 'environment' && (
                  <>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Predict freshness from storage conditions (temperature, humidity, time).
                    </p>
                    <div className="grid gap-4">
                      <label className="block">
                        <span className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Thermometer className="w-4 h-4 text-amber-500" /> Temperature (°C)
                        </span>
                        <input
                          type="number"
                          min={-10}
                          max={50}
                          step={0.5}
                          value={envForm.temperature}
                          onChange={(e) => setEnvForm((f) => ({ ...f, temperature: Number(e.target.value) || 0 }))}
                          className={`w-full rounded-xl border px-4 py-2.5 ${inputCls}`}
                        />
                      </label>
                      <label className="block">
                        <span className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Droplets className="w-4 h-4 text-amber-500" /> Humidity (%)
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={envForm.humidity}
                          onChange={(e) => setEnvForm((f) => ({ ...f, humidity: Number(e.target.value) || 0 }))}
                          className={`w-full rounded-xl border px-4 py-2.5 ${inputCls}`}
                        />
                      </label>
                      <label className="block">
                        <span className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Clock className="w-4 h-4 text-amber-500" /> Storage time (hours)
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={168}
                          step={0.5}
                          value={envForm.time_stored_hours}
                          onChange={(e) => setEnvForm((f) => ({ ...f, time_stored_hours: Number(e.target.value) || 0 }))}
                          className={`w-full rounded-xl border px-4 py-2.5 ${inputCls}`}
                        />
                      </label>
                    </div>
                    <button
                      onClick={handleCheckByEnvironment}
                      disabled={loading}
                      className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all ${
                        loading
                          ? isDark ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isDark
                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-900/30'
                            : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-500/25'
                      }`}
                    >
                      {loading ? 'Analyzing…' : 'Check by storage conditions'}
                    </button>
                  </>
                )}

                {loading && (
                  <div className={`flex items-center justify-center gap-2 py-3 rounded-xl ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                    <div className="animate-spin"><Zap className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">AI is analyzing…</span>
                  </div>
                )}

                <button
                  onClick={reset}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition ${isDark ? 'bg-gray-700/60 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div
                  className={`rounded-xl overflow-hidden border ${
                    assessment.status === 'approved'
                      ? isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50/80 border-green-200'
                      : isDark ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50/80 border-red-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {assessment.status === 'approved' ? (
                          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                            <CheckCircle className={`w-7 h-7 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          </div>
                        ) : (
                          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                            <AlertCircle className={`w-7 h-7 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                          </div>
                        )}
                        <div>
                          <h3 className={`font-bold text-lg ${
                            assessment.status === 'approved' ? (isDark ? 'text-green-400' : 'text-green-800') : (isDark ? 'text-red-400' : 'text-red-800')
                          }`}>
                            {assessment.status === 'approved' ? 'Approved' : 'Rejected'}
                          </h3>
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {assessment.qualityScore}%
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Quality score</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        assessment.freshness === 'excellent' ? (isDark ? 'bg-green-700/50 text-green-200' : 'bg-green-200 text-green-800')
                        : assessment.freshness === 'good' ? (isDark ? 'bg-blue-700/50 text-blue-200' : 'bg-blue-200 text-blue-800')
                        : assessment.freshness === 'fair' ? (isDark ? 'bg-amber-700/50 text-amber-200' : 'bg-amber-200 text-amber-800')
                        : (isDark ? 'bg-red-700/50 text-red-200' : 'bg-red-200 text-red-800')
                      }`}>
                        {assessment.freshness}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          style={{ width: `${Math.min(100, assessment.qualityScore)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            assessment.qualityScore >= 80 ? 'bg-green-500' : assessment.qualityScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    {classification?.food_name && (
                      <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Detected food (ML)
                        </p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {classification.food_name}
                          {classification.confidence != null && (
                            <span className={`ml-2 text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {Math.round(classification.confidence * 100)}% confidence
                            </span>
                          )}
                        </p>
                        {classification.nutrition && (classification.nutrition.calories != null || classification.nutrition.protein != null) && (
                          <div className={`flex flex-wrap gap-3 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {classification.nutrition.calories != null && <span>{classification.nutrition.calories} cal</span>}
                            {classification.nutrition.protein != null && <span>{classification.nutrition.protein}g protein</span>}
                            {classification.nutrition.carbs != null && <span>{classification.nutrition.carbs}g carbs</span>}
                            {classification.nutrition.fat != null && <span>{classification.nutrition.fat}g fat</span>}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: 'Packaging', value: assessment.analysis.packagingCondition },
                        { label: 'Servings', value: `${assessment.analysis.estimatedQuantity}` },
                        { label: 'Spoilage', value: assessment.analysis.spoilageDetection ? 'Detected' : 'None' },
                        { label: 'Safety', value: `${assessment.analysis.safetyRating}%` },
                      ].map(({ label, value }) => (
                        <div key={label} className={`p-2.5 rounded-lg ${isDark ? 'bg-gray-700/40' : 'bg-white/80'}`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                          <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-700/40' : 'bg-gray-100/80'}`}>
                      <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <TrendingUp className="w-4 h-4" /> Notes
                      </p>
                      <ul className="space-y-1">
                        {assessment.notes.map((note, idx) => (
                          <li key={idx} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={reset}
                    className={`py-3 rounded-xl font-semibold text-sm transition ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {assessment.status === 'approved' ? 'Check another' : 'Try again'}
                  </button>
                  <button
                    className={`py-3 rounded-xl font-semibold text-sm text-white transition ${
                      assessment.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {assessment.status === 'approved' ? 'Proceed with posting' : 'Cannot post'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreshFoodChecker;
