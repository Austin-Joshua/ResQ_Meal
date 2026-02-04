import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react';

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

const FreshFoodChecker: React.FC<FreshFoodCheckerProps> = ({ darkMode, onPass, onFail }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<FoodAssessment | null>(null);
  const [showCheckForm, setShowCheckForm] = useState(false);

  // Mock AI assessment results
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
    const notes: string[] = [];
    
    if (score >= 85) {
      notes.push('✓ Excellent condition - prime quality food');
      notes.push('✓ Optimal freshness for immediate distribution');
      notes.push('✓ Packaging intact and clean');
    } else if (score >= 70) {
      notes.push('✓ Good condition - suitable for donation');
      notes.push('✓ Acceptable freshness level');
      notes.push('✓ Minor packaging wear acceptable');
    } else if (score >= 50) {
      notes.push('⚠ Fair condition - acceptable with precautions');
      notes.push('⚠ Recommended for consumption within 2-4 hours');
      notes.push('⚠ Inspect before distribution');
    } else {
      notes.push('❌ Poor condition - not recommended');
      notes.push('❌ Spoilage indicators detected');
      notes.push('❌ Do not distribute');
    }
    
    return notes;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCheck = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = mockAssessment();
      setAssessment(result);
      
      if (result.status === 'approved' && onPass) {
        onPass(result);
      } else if (result.status === 'rejected' && onFail) {
        onFail();
      }
    } catch (error) {
      console.error('Error checking food:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setAssessment(null);
    setShowCheckForm(false);
  };

  return (
    <div className={`rounded-lg p-6 ${
      darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <Zap className={`w-6 h-6 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Fresh Food Checker
        </h2>
      </div>

      {!showCheckForm ? (
        <button
          onClick={() => setShowCheckForm(true)}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            darkMode
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
          }`}
        >
          Start Fresh Food Check
        </button>
      ) : (
        <div className="space-y-4">
          {!assessment ? (
            <>
              {/* File Upload */}
              <div className={`border-2 border-dashed rounded-lg p-6 transition ${
                darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
              }`}>
                <label className="flex flex-col items-center justify-center cursor-pointer gap-2">
                  <Upload className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upload Food Photo
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    JPG, PNG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Food preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    File: {file?.name}
                  </p>
                </div>
              )}

              {/* Check Button */}
              <button
                onClick={handleCheck}
                disabled={!file || loading}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  loading || !file
                    ? darkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : darkMode
                      ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800'
                      : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800'
                }`}
              >
                {loading ? 'Analyzing Food Quality...' : 'Check Fresh Food'}
              </button>

              {loading && (
                <div className={`text-center py-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span>AI is analyzing your food...</span>
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                className={`w-full py-2 rounded-lg font-medium transition ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* Assessment Result */}
              <div className={`rounded-lg p-4 ${
                assessment.status === 'approved'
                  ? darkMode
                    ? 'bg-green-900/30 border border-green-700/50'
                    : 'bg-green-50 border border-green-200'
                  : darkMode
                    ? 'bg-red-900/30 border border-red-700/50'
                    : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {assessment.status === 'approved' ? (
                    <CheckCircle className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  ) : (
                    <AlertCircle className={`w-8 h-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${
                      assessment.status === 'approved'
                        ? darkMode ? 'text-green-400' : 'text-green-700'
                        : darkMode ? 'text-red-400' : 'text-red-700'
                    }`}>
                      {assessment.status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Quality Score: {assessment.qualityScore}%
                    </p>
                  </div>
                </div>

                {/* Quality Score Bar */}
                <div className="mb-4">
                  <div
                    className={`w-full h-3 rounded-full overflow-hidden ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    {(() => {
                      const score = assessment.qualityScore;
                      const widthClass =
                        score >= 90
                          ? 'w-full'
                          : score >= 70
                          ? 'w-3/4'
                          : score >= 50
                          ? 'w-1/2'
                          : 'w-1/4';
                      const colorClass =
                        score >= 80
                          ? 'bg-green-500'
                          : score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500';
                      return (
                        <div
                          className={`h-full ${widthClass} ${colorClass} transition-all`}
                          aria-hidden="true"
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Freshness Badge */}
                <div className="mb-4 inline-block">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    assessment.freshness === 'excellent'
                      ? darkMode ? 'bg-green-700 text-green-100' : 'bg-green-100 text-green-800'
                      : assessment.freshness === 'good'
                        ? darkMode ? 'bg-blue-700 text-blue-100' : 'bg-blue-100 text-blue-800'
                        : assessment.freshness === 'fair'
                          ? darkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                          : darkMode ? 'bg-red-700 text-red-100' : 'bg-red-100 text-red-800'
                  }`}>
                    {assessment.freshness.toUpperCase()}
                  </span>
                </div>

                {/* Analysis Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Packaging
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {assessment.analysis.packagingCondition}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estimated Quantity
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {assessment.analysis.estimatedQuantity} servings
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Spoilage Risk
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {assessment.analysis.spoilageDetection ? 'Detected' : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Safety Rating
                    </p>
                    <p className={`font-semibold flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {assessment.analysis.safetyRating}%
                      {assessment.analysis.safetyRating >= 70 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className={`rounded p-3 mb-4 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    Assessment Notes
                  </p>
                  <ul className="space-y-1">
                    {assessment.notes.map((note, idx) => (
                      <li key={idx} className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {assessment.status === 'approved' ? (
                  <>
                    <button
                      onClick={reset}
                      className={`py-2 rounded-lg font-semibold transition ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Check Another
                    </button>
                    <button
                      className={`py-2 rounded-lg font-semibold text-white transition bg-green-600 hover:bg-green-700`}
                    >
                      ✓ Proceed with Posting
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={reset}
                      className={`py-2 rounded-lg font-semibold transition ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Try Again
                    </button>
                    <button
                      className={`py-2 rounded-lg font-semibold text-white transition bg-red-600 hover:bg-red-700`}
                    >
                      ✗ Cannot Post
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FreshFoodChecker;
