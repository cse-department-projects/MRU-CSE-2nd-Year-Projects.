package com.disastermanagement.service;

import com.disastermanagement.auth.SupabaseClient;
import com.disastermanagement.dao.UserDAO;
import com.disastermanagement.dao.VolunteerDAO;
import com.disastermanagement.dao.RescueTeamDAO;
import com.disastermanagement.model.RescueTeam;
import com.disastermanagement.model.User;
import com.disastermanagement.model.UserRole;
import com.disastermanagement.model.Volunteer;
import com.disastermanagement.util.PasswordUtil;
import com.disastermanagement.util.ValidationUtil;

public class AuthService {
    private final UserDAO userDAO = new UserDAO();
    private final VolunteerDAO volunteerDAO = new VolunteerDAO();
    private final RescueTeamDAO rescueTeamDAO = new RescueTeamDAO();

    private static User currentUser;

    public static User getCurrentUser() {
        return currentUser;
    }

    public static void setCurrentUser(User user) {
        currentUser = user;
    }

    public static void logout() {
        currentUser = null;
    }

    public User login(String usernameOrEmail, String password) throws Exception {
        if (ValidationUtil.isEmpty(usernameOrEmail) || ValidationUtil.isEmpty(password)) {
            throw new Exception("Username/Email and Password cannot be empty.");
        }

        User user = userDAO.findByUsername(usernameOrEmail);
        if (user == null) {
            user = userDAO.findByEmail(usernameOrEmail);
        }

        if (user == null) {
            throw new Exception("Invalid username or password.");
        }

        boolean valid = PasswordUtil.verifyPassword(password, user.getPasswordHash(), user.getSalt());
        if (!valid) {
            throw new Exception("Invalid username or password.");
        }

        currentUser = user;
        return user;
    }

    /**
     * Google Auth login / signup flow.
     * Launches Supabase OAuth URL and returns/creates local user session.
     */
    public User loginWithGoogleOAuth(String googleEmail, String fullName) throws Exception {
        // Launch OAuth URL in default browser
        SupabaseClient.launchGoogleOAuth();

        if (googleEmail == null || googleEmail.trim().isEmpty()) {
            googleEmail = "google_user_" + System.currentTimeMillis() + "@gmail.com";
        }
        if (fullName == null || fullName.trim().isEmpty()) {
            fullName = "Google Account User";
        }

        User user = userDAO.findByEmail(googleEmail);
        if (user == null) {
            // First time Google Sign-In -> create new user with uncompleted profile
            String username = googleEmail.split("@")[0] + "_g";
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword("google_oauth_pass", salt);

            user = new User(username, hash, salt, fullName, googleEmail, "Pending Phone", UserRole.CITIZEN);
            user.setProfileComplete(false); // Triggers "Complete Your Profile"
            userDAO.createUser(user);
        }

        currentUser = user;
        return user;
    }

    /**
     * First-time user profile setup completion.
     */
    public boolean completeProfile(User user, UserRole selectedRole, String phone, String location, String skillOrTeamName) throws Exception {
        if (user == null) throw new Exception("User session not found.");
        if (selectedRole == UserRole.ADMIN) {
            throw new Exception("Administrator role cannot be freely selected.");
        }
        if (ValidationUtil.isEmpty(phone)) {
            throw new Exception("Phone number is required.");
        }

        user.setRole(selectedRole);
        user.setPhone(phone);
        user.setLocation(location != null ? location : "City Center");
        user.setProfileComplete(true);

        boolean updated = userDAO.updateUser(user);

        if (updated) {
            // Create role-specific records if volunteer or rescue team
            if (selectedRole == UserRole.VOLUNTEER) {
                Volunteer v = new Volunteer();
                v.setUserId(user.getId());
                v.setPhone(phone);
                v.setEmail(user.getEmail());
                v.setLocation(user.getLocation());
                v.setSkill(Volunteer.Skill.fromString(skillOrTeamName != null ? skillOrTeamName : "FIRST_AID"));
                v.setAvailability(Volunteer.Availability.AVAILABLE);
                volunteerDAO.createOrUpdateVolunteer(v);
            } else if (selectedRole == UserRole.RESCUE_TEAM) {
                RescueTeam rt = new RescueTeam();
                rt.setUserId(user.getId());
                rt.setTeamName(skillOrTeamName != null && !skillOrTeamName.isEmpty() ? skillOrTeamName : user.getFullName() + " Rescue Team");
                rt.setLeaderName(user.getFullName());
                rt.setContactNumber(phone);
                rt.setSpecialization("General Emergency Response");
                rt.setActiveStatus(RescueTeam.TeamStatus.AVAILABLE);
                rescueTeamDAO.createOrUpdateTeam(rt);
            }
        }

        currentUser = user;
        return updated;
    }

    public boolean register(String username, String password, String fullName, String email, String phone, UserRole role) throws Exception {
        if (ValidationUtil.isEmpty(username) || username.length() < 3) {
            throw new Exception("Username must be at least 3 characters long.");
        }
        if (ValidationUtil.isEmpty(password) || password.length() < 6) {
            throw new Exception("Password must be at least 6 characters long.");
        }
        if (ValidationUtil.isEmpty(fullName)) {
            throw new Exception("Full Name is required.");
        }
        if (!ValidationUtil.isValidEmail(email)) {
            throw new Exception("Please enter a valid email address.");
        }
        if (!ValidationUtil.isValidPhone(phone)) {
            throw new Exception("Please enter a valid phone number.");
        }

        if (userDAO.findByUsername(username) != null) {
            throw new Exception("Username '" + username + "' is already taken.");
        }
        if (userDAO.findByEmail(email) != null) {
            throw new Exception("Email '" + email + "' is already registered.");
        }

        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);

        User newUser = new User(username, hash, salt, fullName, email, phone, role);
        return userDAO.createUser(newUser);
    }
}
