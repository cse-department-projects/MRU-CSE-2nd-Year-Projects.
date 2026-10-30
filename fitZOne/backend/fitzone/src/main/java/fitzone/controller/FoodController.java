package fitzone.controller;

import fitzone.entity.Food;
import fitzone.service.FoodService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodService service;

    public FoodController(FoodService service) {
        this.service = service;
    }

    @PostMapping("/save")
    public Food saveFood(@RequestBody Food food) {
        return service.saveFood(food);
    }

    @GetMapping("/user/{userId}")
    public List<Food> getFoods(
            @PathVariable Long userId) {

        return service.getFoodsByUser(userId);
    }
}