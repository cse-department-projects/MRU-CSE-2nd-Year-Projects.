package fitzone.repository;

import fitzone.entity.FitnessProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FitnessProfileRepository extends JpaRepository<FitnessProfile, Long> {

    Optional<FitnessProfile> findByUserId(Long userId);
}