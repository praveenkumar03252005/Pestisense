import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Thermometer, Droplets, Wind, Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WeatherForecast() {
  const [city, setCity] = useState('Madanapalle');
  const [searchInput, setSearchInput] = useState('');
  const [forecast, setForecast] = useState<any[]>([]);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('');
    
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Mock weather data generator based on city name to simulate real response
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date().getDay();
      
      const newForecast = Array.from({ length: 6 }).map((_, i) => {
        const dayIdx = (today + i) % 7;
        const tempBase = 28 + Math.random() * 8;
        const rainChance = Math.random() * 100;
        
        let condition = 'Sunny';
        if (rainChance > 70) condition = 'Storm';
        else if (rainChance > 40) condition = 'Rain';
        else if (rainChance > 20) condition = 'Cloudy';

        return {
          day: days[dayIdx],
          temp: Math.round(tempBase),
          rain: Math.round(rainChance),
          condition
        };
      });

      setCurrentWeather({
        temp: Math.round(28 + Math.random() * 7),
        humidity: Math.round(50 + Math.random() * 40),
        wind: Math.round(5 + Math.random() * 15),
        condition: newForecast[0].condition,
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1)
      });
      
      setForecast(newForecast);
      setCity(cityName);
    } catch (err) {
      setError('Could not find weather for this location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Madanapalle');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput);
      setSearchInput('');
    }
  };

  const getIcon = (condition: string, size = "w-8 h-8") => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className={`${size} text-amber-500`} />;
      case 'cloudy': return <Cloud className={`${size} text-gray-400`} />;
      case 'rain': return <CloudRain className={`${size} text-blue-500`} />;
      case 'storm': return <CloudLightning className={`${size} text-purple-500`} />;
      default: return <Sun className={`${size} text-amber-500`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text"
              placeholder="Enter City or Mandal (e.g. Rayachoti, Pileru)..."
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-farm focus:border-transparent outline-none transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-farm text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            Get Weather
          </button>
        </form>
        {error && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{error}</p>}
      </div>

      <AnimatePresence mode="wait">
        {currentWeather && !loading && (
          <motion.div
            key={currentWeather.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white flex justify-between items-center shadow-xl relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-blue-100 font-bold text-sm tracking-widest uppercase mb-1">
                    <MapPin className="w-4 h-4" />
                    {currentWeather.city}, Chittoor Dist.
                  </div>
                  <div className="text-5xl font-black mb-2">{currentWeather.temp}°C</div>
                  <div className="flex items-center gap-4 text-blue-50">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Droplets className="w-4 h-4" /> {currentWeather.humidity}% Humidity
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      <Wind className="w-4 h-4" /> {currentWeather.wind}km/h Wind
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 bg-white/10 p-6 rounded-full backdrop-blur-md border border-white/20"
                >
                  {getIcon(currentWeather.condition, "w-16 h-16")}
                </motion.div>
              </div>
              
              <div className="bg-amber-50 p-6 border border-amber-100 rounded-3xl flex flex-col justify-center shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-widest mb-3">
                  <Thermometer className="w-4 h-4" />
                  Tomato Spray Advisory
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 w-2 h-2 rounded-full ${currentWeather.wind < 15 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="text-xs text-stone-700 font-bold">
                      {currentWeather.wind < 15 ? 'Wind speed is ideal for spraying.' : 'High winds! Avoid spraying to prevent drift.'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 w-2 h-2 rounded-full ${currentWeather.humidity < 85 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <p className="text-xs text-stone-700 font-bold">
                      {currentWeather.humidity < 85 ? 'Good humidity for absorption.' : 'High humidity may lead to fungal growth.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pt-2">
              {forecast.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 w-32 bg-white border border-stone-100 p-5 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-green-farm transition-all group"
                >
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4 group-hover:text-green-farm">{f.day}</div>
                  <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform">
                    {getIcon(f.condition, "w-10 h-10")}
                  </div>
                  <div className="text-2xl font-black text-stone-900 mb-1">{f.temp}°</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${f.rain > 30 ? 'text-blue-500' : 'text-stone-400'}`}>
                    {f.rain}% Rain
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-stone-100">
          <Loader2 className="w-10 h-10 text-green-farm animate-spin mb-4" />
          <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Fetching local climate data...</p>
        </div>
      )}
    </div>
  );
}
