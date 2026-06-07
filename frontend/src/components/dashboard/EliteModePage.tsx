import React, { useState, useEffect } from 'react';
import { Crown, Heart, MapPin, Navigation, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { organisationApi } from '@/services/api';

// Elite registration: home address + list of foods (for "My registrations" and map link)
export interface EliteFoodItem {
  id: string;
  name: string;
  type: string;
  quantity: string;
}
export interface EliteRegistration {
  id: string;
  address: string;
  foods: EliteFoodItem[];
}

// Elite Mode Page – for elders in care homes who eat marriage/event food and food ordered by kids, not donated surplus
export function EliteModePage( { darkMode, onBack, t }: { darkMode: boolean; onBack: () => void; t: any }) {
  const [eliteView, setEliteView] = useState<'info' | 'register' | 'browse'>('info');
  const [homeAddress, setHomeAddress] = useState('');
  const [establishmentType, setEstablishmentType] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [residentCount, setResidentCount] = useState('');
  const [preferredWedding, setPreferredWedding] = useState(true);
  const [preferredFestival, setPreferredFestival] = useState(true);
  const [preferredCelebration, setPreferredCelebration] = useState(true);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [foods, setFoods] = useState<EliteFoodItem[]>([{ id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
  const [registrations, setRegistrations] = useState<EliteRegistration[]>([]);
  const [eliteFoodsList, setEliteFoodsList] = useState<Array<{ id: number; food_name: string; food_type: string; quantity_servings: number; address?: string; latitude?: number; longitude?: number; description?: string }>>([]);
  const [eliteFoodsLoading, setEliteFoodsLoading] = useState(false);
  const [selectedEliteFood, setSelectedEliteFood] = useState<typeof eliteFoodsList[0] | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (eliteView !== 'browse') return;
    setEliteFoodsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserCoords(null)
      );
    }
    organisationApi.getAvailableFood()
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setEliteFoodsList(data as typeof eliteFoodsList);
      })
      .catch(() => setEliteFoodsList([]))
      .finally(() => setEliteFoodsLoading(false));
  }, [eliteView]);

  const openMapsForAddress = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const addFood = () => {
    setFoods((prev) => [...prev, { id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
  };
  const removeFood = (id: string) => {
    setFoods((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));
  };
  const updateFood = (id: string, field: keyof EliteFoodItem, value: string) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const submitRegistration = () => {
    const trimmedAddress = homeAddress.trim();
    if (!trimmedAddress) return;
    const foodList = foods.filter((f) => f.name.trim() || f.type.trim() || f.quantity.trim());
    setRegistrations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), address: trimmedAddress, foods: foodList.length ? foodList : foods.map((f) => ({ ...f, name: f.name || '—', type: f.type || '—', quantity: f.quantity || '—' })) },
    ]);
    setHomeAddress('');
    setEstablishmentType('');
    setContactName('');
    setContactPhone('');
    setResidentCount('');
    setDietaryNotes('');
    setFoods([{ id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
  };

  const cardCls = darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm';
  const inputCls = darkMode
    ? 'bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-amber-500/50 focus:border-amber-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-amber-400 focus:border-amber-500';

  // Register view: form + My registrations with map link
  if (eliteView === 'register') {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
        <button
          onClick={() => setEliteView('info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          {t('eliteBackToElite')}
        </button>

        <div className={`rounded-2xl p-8 transition-all duration-300 border ${cardCls}`}>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteRegisterHome')}
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-blue-100' : 'text-slate-600'}`}>
            {t('eliteRegisterHomeDesc')}
          </p>

          <label className="block mb-4">
            <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('eliteHomeAddress')}
            </span>
            <input
              type="text"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder={t('eliteHomeAddressPlaceholder')}
              className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
            />
          </label>

          <label className="block mb-4">
            <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('eliteEstablishmentType')}
            </span>
            <input
              type="text"
              value={establishmentType}
              onChange={(e) => setEstablishmentType(e.target.value)}
              placeholder={t('eliteEstablishmentTypePlaceholder')}
              className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('eliteContactName')}
              </span>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t('eliteContactNamePlaceholder')}
                className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
              />
            </label>
            <label className="block">
              <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('eliteContactPhone')}
              </span>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={t('eliteContactPhonePlaceholder')}
                className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
              />
            </label>
          </div>

          <label className="block mb-4">
            <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('eliteResidentCount')}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={residentCount}
              onChange={(e) => setResidentCount(e.target.value)}
              placeholder={t('eliteResidentCountPlaceholder')}
              className={`w-full max-w-[140px] rounded-xl border px-4 py-3 ${inputCls}`}
            />
          </label>

          <div className="mb-4">
            <span className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('elitePreferredFoodTypes')}
            </span>
            <div className="flex flex-wrap gap-4">
              <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={preferredWedding} onChange={(e) => setPreferredWedding(e.target.checked)} className="rounded border-slate-400" />
                {t('elitePreferredWedding')}
              </label>
              <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={preferredFestival} onChange={(e) => setPreferredFestival(e.target.checked)} className="rounded border-slate-400" />
                {t('elitePreferredFestival')}
              </label>
              <label className={`flex items-center gap-2 cursor-pointer ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <input type="checkbox" checked={preferredCelebration} onChange={(e) => setPreferredCelebration(e.target.checked)} className="rounded border-slate-400" />
                {t('elitePreferredCelebration')}
              </label>
            </div>
          </div>

          <label className="block mb-6">
            <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {t('eliteDietaryNotes')}
            </span>
            <input
              type="text"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder={t('eliteDietaryNotesPlaceholder')}
              className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
            />
          </label>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('eliteFoodsAvailable')}
              </span>
              <button
                type="button"
                onClick={addFood}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  darkMode ? 'bg-amber-600/40 text-amber-200 hover:bg-amber-600/60' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <Plus className="w-4 h-4" /> {t('eliteAddFood')}
              </button>
            </div>
            <div className="space-y-3">
              {foods.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => updateFood(f.id, 'name', e.target.value)}
                    placeholder={t('eliteFoodName')}
                    className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <input
                    type="text"
                    value={f.type}
                    onChange={(e) => updateFood(f.id, 'type', e.target.value)}
                    placeholder={t('eliteFoodType')}
                    className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <input
                    type="text"
                    value={f.quantity}
                    onChange={(e) => updateFood(f.id, 'quantity', e.target.value)}
                    placeholder={t('eliteQuantity')}
                    className={`w-24 rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFood(f.id)}
                    className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                    aria-label="Remove food"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={submitRegistration}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition ${
              darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {t('eliteSubmitRegistration')}
          </button>
        </div>

        <div className={`rounded-2xl p-6 transition-all duration-300 border ${cardCls}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteMyRegistrations')}
          </h3>
          {registrations.length === 0 ? (
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('eliteNoRegistrationsYet')}</p>
          ) : (
            <ul className="space-y-4">
              {registrations.map((reg) => (
                <li
                  key={reg.id}
                  className={`rounded-xl p-4 border transition ${
                    darkMode ? 'bg-slate-800/40 border-slate-600' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {reg.address}
                  </p>
                  {reg.foods.length > 0 && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {reg.foods.map((f) => `${f.name || '—'} (${f.type || '—'}) × ${f.quantity || '—'}`).join(' · ')}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => openMapsForAddress(reg.address)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      darkMode ? 'bg-emerald-600/50 text-emerald-200 hover:bg-emerald-600/70' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> {t('eliteViewOnMap')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Browse view: available special event food (wedding, festival, celebration) with distance and Get directions
  if (eliteView === 'browse') {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
        <button
          onClick={() => setEliteView('info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          {t('eliteBackToElite')}
        </button>
        <div className={`rounded-2xl p-6 transition-all duration-300 border ${cardCls}`}>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteBrowseTitle')}
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-blue-100' : 'text-slate-600'}`}>
            {t('eliteBrowseDesc')}
          </p>
          {eliteFoodsLoading ? (
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Loading...</p>
          ) : eliteFoodsList.length === 0 ? (
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{t('eliteNoEliteFoodsYet')}</p>
          ) : (
            <ul className="space-y-4">
              {eliteFoodsList.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEliteFood(item)}
                    className={`w-full text-left rounded-xl p-4 border transition hover:ring-2 hover:ring-amber-500/50 ${
                      darkMode ? 'bg-slate-800/40 border-slate-600' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.food_name}</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {(item.food_type || 'food').replace(/^./, (c) => c.toUpperCase())} · {item.quantity_servings} servings
                    </p>
                    {item.address && (
                      <p className={`text-xs mt-2 flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3 shrink-0" /> {item.address}
                      </p>
                    )}
                    {userCoords && item.latitude != null && item.longitude != null && (
                      <p className={`text-sm mt-2 font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {t('eliteDistanceAway').replace('{{km}}', getDistanceKm(userCoords.lat, userCoords.lng, Number(item.latitude), Number(item.longitude)).toFixed(1))}
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1 mt-2 text-sm font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      <Navigation className="w-4 h-4" /> {t('eliteGetDirections')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Dialog open={!!selectedEliteFood} onOpenChange={(open) => !open && setSelectedEliteFood(null)}>
          <DialogContent className={`max-w-md ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`}>
            <DialogHeader>
              <DialogTitle>{selectedEliteFood?.food_name ?? '—'}</DialogTitle>
            </DialogHeader>
            {selectedEliteFood && (
              <div className="space-y-4">
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {(selectedEliteFood.food_type || 'food').replace(/^./, (c) => c.toUpperCase())} · {selectedEliteFood.quantity_servings} servings
                </p>
                {userCoords && selectedEliteFood.latitude != null && selectedEliteFood.longitude != null && (
                  <p className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {t('eliteDistanceAway').replace('{{km}}', getDistanceKm(userCoords.lat, userCoords.lng, Number(selectedEliteFood.latitude), Number(selectedEliteFood.longitude)).toFixed(1))}
                  </p>
                )}
                {selectedEliteFood.address && (
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedEliteFood.address}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedEliteFood.address) openMapsForAddress(selectedEliteFood.address);
                    setSelectedEliteFood(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  <MapPin className="w-4 h-4" /> {t('eliteViewOnMap')}
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-emerald-800/40 text-slate-200'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Hero */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <Crown className={`w-10 h-10 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            {t('eliteTitle')}
          </h2>
        </div>
        <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {t('eliteSubtitle')}
        </p>
      </div>

      {/* Who is Elite Mode for? */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteWho')}
        </h3>
        <p className={`${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteWhoDesc')}
        </p>
      </div>

      {/* What food do they eat? */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteWhat')}
        </h3>
        <p className={`${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteWhatDesc')}
        </p>
      </div>

      {/* Festival-made food – also served on the website */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-50/80 border-amber-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteFestivalTitle')}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            darkMode ? 'bg-emerald-600/40 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {t('eliteFestivalServed')}
          </span>
        </div>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteFestivalDesc')}
        </p>
        <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-amber-200/90' : 'text-amber-800'}`}>
          {t('eliteFestivalExamplesLabel')}
        </p>
        <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx1')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx2')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx3')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx4')}
          </li>
          <li className="flex items-center gap-2 sm:col-span-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx5')}
          </li>
        </ul>
      </div>

      {/* How Elite Mode works */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteHow')}
        </h3>
        <ul className="space-y-4">
          {[
            { step: 1, body: t('eliteHow1') },
            { step: 2, body: t('eliteHow2') },
            { step: 3, body: t('eliteHow3') },
          ].map(({ step, body }) => (
            <li key={step} className={`flex gap-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                darkMode ? 'bg-amber-600/40 text-amber-300' : 'bg-amber-100 text-amber-700'
              }`}>
                {step}
              </span>
              <span className="font-medium">{body}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Get involved + Browse + Register */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/25 border-emerald-600/30' : 'bg-amber-50 border-amber-200 shadow-sm'
      }`}>
        <p className={`font-semibold mb-4 ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
          {t('getInvolvedElite')}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setEliteView('browse')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
              darkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <Heart className="w-4 h-4" /> {t('eliteBrowseTitle')}
          </button>
          <button
            type="button"
            onClick={() => setEliteView('register')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
              darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <Plus className="w-4 h-4" /> {t('eliteRegister')}
          </button>
        </div>
      </div>
    </div>
  );
};