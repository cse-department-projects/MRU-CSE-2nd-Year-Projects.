package com.smartvillage.controller;

import com.smartvillage.model.User;
import com.smartvillage.repository.UserRepository;
import com.smartvillage.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping("/")
    public String index(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        if (loggedInUser != null) {
            if ("ADMIN".equals(loggedInUser.getRole())) {
                return "redirect:/admin/dashboard";
            } else {
                return "redirect:/citizen/dashboard";
            }
        }
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String showLoginForm(@RequestParam(value = "role", defaultValue = "CITIZEN") String role,
                                @RequestParam(value = "error", required = false) String error,
                                @RequestParam(value = "logout", required = false) String logout,
                                Model model) {
        model.addAttribute("selectedRole", role);
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid username, password, or role selection!");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "Logged out successfully.");
        }
        return "login";
    }

    @PostMapping("/login")
    public String processLogin(@RequestParam("username") String username,
                               @RequestParam("password") String password,
                               @RequestParam("role") String role,
                               HttpSession session,
                               HttpServletRequest request,
                               RedirectAttributes redirectAttributes) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Validate password and role
            if (user.getPassword().equals(password) && user.getRole().equalsIgnoreCase(role)) {
                session.setAttribute("loggedInUser", user);
                session.setAttribute("userRole", user.getRole());
                
                activityLogService.log(user.getUsername(), user.getRole(), "LOGIN", 
                    "User '" + user.getFullName() + "' (" + user.getUsername() + ") successfully logged in as " + user.getRole(), request);

                if ("ADMIN".equalsIgnoreCase(role)) {
                    return "redirect:/admin/dashboard";
                } else {
                    return "redirect:/citizen/dashboard";
                }
            }
        }
        
        activityLogService.log(username, role, "LOGIN_FAILED", 
            "Failed login attempt for username: " + username + " with role: " + role, "FAILED", request);

        redirectAttributes.addFlashAttribute("errorMessage", "Invalid credentials or role mismatch. Please try again.");
        return "redirect:/login?role=" + role + "&error=true";
    }

    @GetMapping("/register")
    public String showRegisterForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String processRegistration(@ModelAttribute User user, 
                                      HttpServletRequest request,
                                      RedirectAttributes redirectAttributes) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            activityLogService.log(user.getUsername(), "CITIZEN", "REGISTRATION_FAILED", 
                "Attempted registration failed: username '" + user.getUsername() + "' already taken", "FAILED", request);
            redirectAttributes.addFlashAttribute("errorMessage", "Username already exists! Please choose another.");
            return "redirect:/register";
        }

        user.setRole("CITIZEN");
        user.setStatus("ACTIVE");
        userRepository.save(user);

        String details = String.format("Registered new citizen: FullName='%s', Username='%s', Phone='%s', Email='%s', Aadhaar='%s', RationCard='%s', Ward='%s', Occupation='%s', FamilyMembers=%s, Address='%s'",
            user.getFullName(), user.getUsername(), user.getPhone(), user.getEmail(), user.getAadhaar(), user.getRationCard(),
            user.getWardNumber(), user.getOccupation(), user.getHouseholdMembers(), user.getAddress());

        activityLogService.log(user.getUsername(), "CITIZEN", "CITIZEN_REGISTRATION", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Account created successfully! Please login with your credentials.");
        return "redirect:/login?role=CITIZEN";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session, HttpServletRequest request) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        if (loggedInUser != null) {
            activityLogService.log(loggedInUser.getUsername(), loggedInUser.getRole(), "LOGOUT", 
                "User '" + loggedInUser.getFullName() + "' (" + loggedInUser.getUsername() + ") logged out", request);
        }
        session.invalidate();
        return "redirect:/login?logout=true";
    }
}
