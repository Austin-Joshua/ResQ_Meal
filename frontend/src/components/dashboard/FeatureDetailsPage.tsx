import React from 'react';

export function FeatureDetailsPage( { feature, darkMode, onBack, t }: { feature: string; darkMode: boolean; onBack: () => void; menuFeatures?: unknown[]; t: any }) {
  const featureDetails: Record<string, { title: string; description: string; benefits: string[]; stats: string[] }> = {
    oneClick: {
      title: '📤 One-Click Posting',
      description: 'Post your surplus food in just one click. Perfect for restaurants, catering services, and food businesses.',
      benefits: [
        'Quick posting process - 30 seconds max',
        'Automatic NGO matching',
        'Real-time notifications',
        'Food safety verification included',
      ],
      stats: [
        'Over 50,000+ successful posts',
        'Average 15 minutes to match',
        '95% success rate',
      ],
    },
    smartMatch: {
      title: '🎯 Smart Matching',
      description: 'Our AI-powered matching engine connects your surplus food with the most suitable NGOs based on their needs.',
      benefits: [
        'AI analyzes NGO requirements',
        'Distance-based matching',
        'Capacity aware recommendations',
        'Real-time availability check',
      ],
      stats: [
        'Machine learning model trained on 10K+ matches',
        'Average accuracy: 94%',
        'Processing time: <2 seconds',
      ],
    },
    foodTimer: {
      title: '⚡ Food Safety Timer',
      description: 'Real-time countdown timer to ensure food is consumed within safe consumption window.',
      benefits: [
        'Visual countdown indicator',
        'Alert notifications',
        'Temperature tracking',
        'Food quality monitoring',
      ],
      stats: [
        'Tracks 100,000+ food items daily',
        '99.8% accuracy rate',
        'Prevents 5+ tons of waste monthly',
      ],
    },
    liveTrack: {
      title: '🚚 Live Delivery Tracking',
      description: 'Track your food donations in real-time as volunteers deliver them to NGOs.',
      benefits: [
        'Google Maps integration',
        'Live location updates',
        'Delivery proof photos',
        'Impact metrics in real-time',
      ],
      stats: [
        'Covers 50+ cities',
        'Average delivery time: 45 minutes',
        '200,000+ successful deliveries',
      ],
    },
    notify: {
      title: '🔔 Notifications',
      description: 'Stay informed with personalized notifications about your donations and their impact.',
      benefits: [
        'Thank you messages',
        'Donation milestones',
        'Impact updates',
        'Urgent requests',
      ],
      stats: [
        'Sends 500K+ notifications daily',
        '87% engagement rate',
        'Customizable preferences',
      ],
    },
    impact: {
      title: '💚 Impact Meter',
      description: 'Visualize your contribution to fighting food waste and hunger in your community.',
      benefits: [
        'Personal impact dashboard',
        'Community rankings',
        'Environmental metrics',
        'Social impact stories',
      ],
      stats: [
        '3.5M+ meals saved',
        '8,625 kg food diverted',
        '21.5 tons CO₂ prevented',
      ],
    },
    carbon: {
      title: '🌱 Carbon Saved',
      description: 'Track the environmental impact of your food donations in terms of carbon reduction.',
      benefits: [
        'CO₂ reduction calculations',
        'Water saved metrics',
        'Carbon offset certificates',
        'Environmental badges',
      ],
      stats: [
        '1 kg food = 2.5 kg CO₂ saved',
        'Monthly carbon reports',
        'Share impact on social media',
      ],
    },
    verify: {
      title: '🛡️ Verification',
      description: 'AI-powered photo verification ensures all donated food meets safety and quality standards.',
      benefits: [
        'AI image recognition',
        'Quality scoring',
        'Safety assessment',
        'Approval workflows',
      ],
      stats: [
        '100,000+ items verified daily',
        '98% accuracy rate',
        'Multi-level verification system',
      ],
    },
  };

  const details = featureDetails[feature] || featureDetails.oneClick;

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {details.title}
        </h1>
        <p className={`text-lg ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {details.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Benefits */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-900/35 to-blue-900/45 border-emerald-600/30 shadow-lg'
            : 'bg-gradient-to-br from-blue-400/10 to-emerald-400/10 border-blue-300/50 shadow-md'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            ✨ Key Benefits
          </h2>
          <ul className="space-y-3">
            {details.benefits.map((benefit, idx) => (
              <li key={idx} className={`flex items-start gap-3 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
                <span className={`text-xl mt-1 ${darkMode ? 'text-yellow-300' : 'text-blue-600'}`}>✓</span>
                <span className="font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistics */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-900/35 to-blue-900/45 border-emerald-600/30 shadow-lg'
            : 'bg-gradient-to-br from-blue-400/10 to-emerald-400/10 border-blue-300/50 shadow-md'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            📊 Impact Stats
          </h2>
          <ul className="space-y-3">
            {details.stats.map((stat, idx) => (
              <li key={idx} className={`flex items-center gap-3 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
                <span className={`text-2xl ${darkMode ? 'text-yellow-400' : 'text-blue-600'}`}>📈</span>
                <span className="font-medium">{stat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};