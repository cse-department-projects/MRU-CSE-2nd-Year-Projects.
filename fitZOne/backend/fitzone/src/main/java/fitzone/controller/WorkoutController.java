package fitzone.controller;

import fitzone.entity.Workout;
import fitzone.service.WorkoutService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "*")
public class WorkoutController {

    private final WorkoutService service;

    public WorkoutController(WorkoutService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public Workout saveWorkout(@RequestBody Workout workout) {
        return service.saveWorkout(workout);
    }

    @GetMapping("/user/{userId}")
    public List<Workout> getWorkouts(
            @PathVariable Long userId) {

        return service.getWorkoutsByUser(userId);
    }
}