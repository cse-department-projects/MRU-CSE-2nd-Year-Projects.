package fitzone.service;

import fitzone.entity.Workout;
import fitzone.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutService {

    private final WorkoutRepository repository;

    public WorkoutService(WorkoutRepository repository) {
        this.repository = repository;
    }

    public Workout saveWorkout(Workout workout) {
        return repository.save(workout);
    }

    public List<Workout> getWorkoutsByUser(Long userId) {
        return repository.findByUserIdOrderByIdDesc(userId);
    }
}