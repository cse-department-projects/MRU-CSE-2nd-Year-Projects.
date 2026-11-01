package com.example.Rural.management.service;

import com.example.Rural.management.exception.ResourceNotFoundException;
import com.example.Rural.management.model.WeatherInfo;
import com.example.Rural.management.repository.WeatherInfoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WeatherService {

    private final WeatherInfoRepository weatherInfoRepository;

    public WeatherService(WeatherInfoRepository weatherInfoRepository) {
        this.weatherInfoRepository = weatherInfoRepository;
    }

    @Transactional(readOnly = true)
    public WeatherInfo getCurrentWeather() {
        return weatherInfoRepository.findFirstByOrderByIdDesc()
                .orElseThrow(() -> new ResourceNotFoundException("No weather data available"));
    }

    @Transactional(readOnly = true)
    public List<WeatherInfo> getAllWeatherRecords() {
        return weatherInfoRepository.findAll();
    }

    public WeatherInfo saveWeather(WeatherInfo weatherInfo) {
        return weatherInfoRepository.save(weatherInfo);
    }

    public WeatherInfo updateWeather(Long id, WeatherInfo details) {
        WeatherInfo weather = weatherInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WeatherInfo", "id", id));
        weather.setLocationName(details.getLocationName());
        weather.setCurrentTemp(details.getCurrentTemp());
        weather.setConditionText(details.getConditionText());
        weather.setHumidityPercentage(details.getHumidityPercentage());
        weather.setWindSpeedKmh(details.getWindSpeedKmh());
        weather.setRainProbability(details.getRainProbability());
        weather.setSoilMoisture(details.getSoilMoisture());
        weather.setFarmerAdvisory(details.getFarmerAdvisory());
        weather.setUpdatedTime(details.getUpdatedTime());
        return weatherInfoRepository.save(weather);
    }
}
