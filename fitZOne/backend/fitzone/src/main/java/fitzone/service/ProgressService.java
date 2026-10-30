package fitzone.service;

import fitzone.entity.Workout;
import fitzone.entity.Water;
import fitzone.repository.WorkoutRepository;
import fitzone.repository.WaterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProgressService {

    private final WorkoutRepository workoutRepository;
    private final WaterRepository waterRepository;

    public ProgressService(
            WorkoutRepository workoutRepository,
            WaterRepository waterRepository) {

        this.workoutRepository = workoutRepository;
        this.waterRepository = waterRepository;
    }

    public List<Workout> getWorkouts(Long userId) {
        return workoutRepository
                .findByUserIdOrderByIdDesc(userId);
    }

    public List<Water> getWaterRecords(Long userId) {
        return waterRepository
                .findByUserIdOrderByIdDesc(userId);
    }
}