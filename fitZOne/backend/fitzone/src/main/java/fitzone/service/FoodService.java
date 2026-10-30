package fitzone.service;

import fitzone.entity.Food;
import fitzone.repository.FoodRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    private final FoodRepository repository;

    public FoodService(FoodRepository repository) {
        this.repository = repository;
    }

    public Food saveFood(Food food) {
        return repository.save(food);
    }

    public List<Food> getFoodsByUser(Long userId) {
        return repository.findByUserIdOrderByIdDesc(userId);
    }
}