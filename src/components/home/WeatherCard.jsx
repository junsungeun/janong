import React from 'react';
import { useWeather } from '../../hooks/useWeather';
import { getRainTypeText } from '../../services/kmaWeatherService';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

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

  return (
    <Card variant="highlight">
      <div className="weather-grid">
        <div className="weather-temp-wrap">
          <span className="weather-temp">{weather.temp}</span>
          <span className="weather-temp-unit">&deg;C</span>
        </div>
        <div className="weather-details">
          <div className="weather-detail-row">
            <span className="weather-label">습도</span>
            <span className="weather-value">{weather.rh}%</span>
          </div>
          <div className="weather-detail-row">
            <span className="weather-label">바람</span>
            <span className="weather-value">{weather.windSpeed}m/s</span>
          </div>
          {rainText && (
            <div className="weather-detail-row">
              <span className="weather-label">강수</span>
              <span className="weather-value">
                {rainText}{weather.rain > 0 ? ` ${weather.rain}mm` : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
