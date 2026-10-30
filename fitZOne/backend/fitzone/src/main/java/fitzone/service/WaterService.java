package fitzone.service;

import fitzone.entity.Water;
import fitzone.repository.WaterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaterService {

    private final WaterRepository repository;

    public WaterService(WaterRepository repository) {
        this.repository = repository;
    }

    public Water saveWater(Water water) {
        return repository.save(water);
    }

    public List<Water> getWaterByUser(Long userId) {
        return repository.findByUserIdOrderByIdDesc(userId);
    }
}