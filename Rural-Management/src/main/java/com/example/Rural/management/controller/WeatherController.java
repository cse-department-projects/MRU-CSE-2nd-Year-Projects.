package com.example.Rural.management.controller;

import com.example.Rural.management.model.WeatherInfo;
import com.example.Rural.management.service.WeatherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<WeatherInfo> getCurrentWeather() {
        return ResponseEntity.ok(weatherService.getCurrentWeather());
    }

    @GetMapping("/all")
    public List<WeatherInfo> getAllWeatherRecords() {
        return weatherService.getAllWeatherRecords();
    }

    @PostMapping
    public ResponseEntity<WeatherInfo> saveWeather(@Valid @RequestBody WeatherInfo weatherInfo) {
        WeatherInfo saved = weatherService.saveWeather(weatherInfo);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeatherInfo> updateWeather(@PathVariable Long id,
                                                      @Valid @RequestBody WeatherInfo weatherInfo) {
        return ResponseEntity.ok(weatherService.updateWeather(id, weatherInfo));
    }
}
