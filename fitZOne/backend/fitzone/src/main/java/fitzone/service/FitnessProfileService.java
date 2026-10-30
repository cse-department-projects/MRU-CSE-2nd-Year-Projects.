package fitzone.service;

import fitzone.entity.FitnessProfile;
import fitzone.repository.FitnessProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FitnessProfileService {

    private final FitnessProfileRepository repository;

    public FitnessProfileService(FitnessProfileRepository repository) {
        this.repository = repository;
    }

    public FitnessProfile saveProfile(FitnessProfile profile) {

        FitnessProfile existing = repository
                .findByUserId(profile.getUserId())
                .orElse(null);

        if (existing != null) {
            existing.setHeight(profile.getHeight());
            existing.setWeight(profile.getWeight());
            existing.setGoal(profile.getGoal());
            existing.setActivityLevel(profile.getActivityLevel());
            existing.setDiet(profile.getDiet());
            existing.setSleepHours(profile.getSleepHours());

            return repository.save(existing);
        }

        return repository.save(profile);
    }

    public Optional<FitnessProfile> getProfile(Long userId) {
        return repository.findByUserId(userId);
    }
}