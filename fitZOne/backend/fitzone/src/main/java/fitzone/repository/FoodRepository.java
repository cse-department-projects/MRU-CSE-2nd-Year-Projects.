package fitzone.repository;

import fitzone.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRepository
        extends JpaRepository<Food, Long> {

    List<Food> findByUserIdOrderByIdDesc(Long userId);
}