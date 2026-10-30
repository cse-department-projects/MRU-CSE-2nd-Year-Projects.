package fitzone.repository;

import fitzone.entity.Water;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaterRepository
        extends JpaRepository<Water, Long> {

    List<Water> findByUserIdOrderByIdDesc(Long userId);
}