package fitzone.service;

import fitzone.entity.User;
import fitzone.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public User signup(User user) {

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        return userRepository.save(user);
    }


    public Optional<User> login(String email, String password) {

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent() &&
                user.get().getPassword().equals(password)) {

            return user;
        }

        return Optional.empty();
    }
// =========================
// UPDATE FITNESS PROFILE
// =========================

public User updateProfile(Long id, User profileData) {

    User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setHeight(profileData.getHeight());
    user.setWeight(profileData.getWeight());
    user.setFitnessGoal(profileData.getFitnessGoal());
    user.setActivityLevel(profileData.getActivityLevel());
    user.setDietPreference(profileData.getDietPreference());
    user.setSleepHours(profileData.getSleepHours());

    return userRepository.save(user);
}
}