import React from 'react';
import { useWeather } from '../../hooks/useWeather';
import { getRainTypeText } from '../../services/kmaWeatherService';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

function getWeatherEmoji(sky, rainType) {
  // rainType: 0=없음, 1=비, 2=비/눈, 3=눈, 5=빗방울, 6=빗방울눈날림, 7=눈날림
  if (rainType >= 1 && rainType <= 2) return '\u{1F327}\u{FE0F}';   // rain
  if (rainType === 3 || rainType === 7) return '\u{1F328}\u{FE0F}';  // snow
  if (rainType >= 5) return '\u{1F326}\u{FE0F}';                     // drizzle
  // sky: 1=맑음, 3=구름많음, 4=흐림
  if (sky === 1) return '\u{2600}\u{FE0F}';
  if (sky === 3) return '\u{26C5}';
  if (sky === 4) return '\u{2601}\u{FE0F}';
  return '\u{1F324}\u{FE0F}';
}

export default function WeatherCard() {
  const { weather, loading } = useWeather();

  if (loading) {
    return (
      <Card variant="highlight">
        <div className="weather-loading">
          <Spinner />
          <span className="text-muted text-sm">날씨 정보를 불러오는 중...</span>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card variant="highlight">
        <p className="text-muted text-sm">날씨 정보를 불러올 수 없습니다.</p>
      </Card>
    );
  }

  const rainText = getRainTypeText(weather.rainType);
  const emoji = getWeatherEmoji(weather.sky, weather.rainType);

  return (
    <Card variant="highlight">
      <div className="weather-card-inner">
        <div className="weather-main">
          <span className="weather-emoji" aria-hidden="true">{emoji}</span>
          <div className="weather-temp-wrap">
            <span className="weather-temp">{weather.temp}</span>
            <span className="weather-temp-unit">&deg;C</span>
          </div>
        </div>
        <div className="weather-detail-grid">
          <div className="weather-detail-item">
            <span className="weather-detail-label">습도</span>
            <span className="weather-detail-value">{weather.rh}%</span>
          </div>
          <div className="weather-detail-item">
            <span className="weather-detail-label">바람</span>
            <span className="weather-detail-value">{weather.windSpeed}m/s</span>
          </div>
          {rainText && (
            <div className="weather-detail-item">
              <span className="weather-detail-label">강수</span>
              <span className="weather-detail-value">
                {rainText}{weather.rain > 0 ? ` ${weather.rain}mm` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
