package fitzone.controller;

import fitzone.entity.FitnessProfile;
import fitzone.service.FitnessProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fitness-profile")
@CrossOrigin(origins = "*")
public class FitnessProfileController {

    private final FitnessProfileService service;

    public FitnessProfileController(FitnessProfileService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public FitnessProfile saveProfile(@RequestBody FitnessProfile profile) {
        return service.saveProfile(profile);
    }

    @GetMapping("/{userId}")
    public FitnessProfile getProfile(@PathVariable Long userId) {
        return service
                .getProfile(userId)
                .orElse(null);
    }
}