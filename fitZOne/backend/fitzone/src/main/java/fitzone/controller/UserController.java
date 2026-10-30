package fitzone.controller;

import fitzone.entity.User;
import fitzone.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }


    // =========================
    // SIGNUP
    // =========================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        try {

            User savedUser = userService.signup(user);

            // Never send password back to browser
            savedUser.setPassword(null);

            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Email already exists or invalid data");
        }
    }


    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> loggedUser =
                userService.login(
                        user.getEmail(),
                        user.getPassword()
                );


        if (loggedUser.isPresent()) {

            User result = loggedUser.get();

            // Don't send password
            result.setPassword(null);

            return ResponseEntity.ok(result);
        }


        return ResponseEntity
                .status(401)
                .body("Invalid email or password");
    }


    // =========================
    // UPDATE FITNESS PROFILE
    // =========================

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody User profileData) {

        try {

            User updatedUser =
                    userService.updateProfile(id, profileData);

            // Never send password back
            updatedUser.setPassword(null);

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Unable to update fitness profile");
        }
    }
}