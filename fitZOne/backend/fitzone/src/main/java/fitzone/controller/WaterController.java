package fitzone.controller;

import fitzone.entity.Water;
import fitzone.service.WaterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/water")
@CrossOrigin(origins = "*")
public class WaterController {

    private final WaterService service;

    public WaterController(WaterService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public Water saveWater(@RequestBody Water water) {
        return service.saveWater(water);
    }

    @GetMapping("/user/{userId}")
    public List<Water> getWater(
            @PathVariable Long userId) {

        return service.getWaterByUser(userId);
    }
}