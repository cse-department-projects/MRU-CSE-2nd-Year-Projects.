package fitzone.controller;

import fitzone.entity.Workout;
import fitzone.entity.Water;
import fitzone.service.ProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    private final ProgressService service;

    public ProgressController(ProgressService service) {
        this.service = service;
    }

    @GetMapping("/workouts/{userId}")
    public List<Workout> getWorkouts(
            @PathVariable Long userId) {

        return service.getWorkouts(userId);
    }

    @GetMapping("/water/{userId}")
    public List<Water> getWater(
            @PathVariable Long userId) {

        return service.getWaterRecords(userId);
    }
}