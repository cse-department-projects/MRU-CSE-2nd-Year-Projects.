package com.athletehub.api;

import com.athletehub.api.dto.auth.RegisterRequest;
import com.athletehub.api.entity.Role;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthLoginTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private void tryLogin(String identifier, String password, boolean expectSuccess) throws Exception {
        System.out.println("--> Testing login with identifier: '" + identifier + "'");
        int expectedStatus = expectSuccess ? 200 : 401;
        var result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + identifier + "\",\"password\":\"" + password + "\"}"))
                .andReturn();

        int actualStatus = result.getResponse().getStatus();
        System.out.println("    Status: " + actualStatus + " | Body: " + result.getResponse().getContentAsString());
        if (expectSuccess && actualStatus != 200) {
            throw new AssertionError("Expected 200 for identifier '" + identifier + "' but got " + actualStatus);
        }
    }

    @Test
    public void testVariousLoginsForSairam() throws Exception {
        // Test Sairam identifiers
        tryLogin("sairam", "Password123!", true);
        tryLogin("Sairam", "Password123!", true);
        tryLogin("SAIRAM", "Password123!", true);
        tryLogin("sairam ", "Password123!", true);
        tryLogin("mangalisairam053@gmail.com", "Password123!", true);
        tryLogin("MANGALISAIRAM053@GMAIL.COM", "Password123!", true);
        tryLogin("Sairam Mangali", "Password123!", true);
        tryLogin("sairammangali", "Password123!", true);
    }

    @Test
    public void testRegistrationAndLoginForAllRoles() throws Exception {
        String[] roles = {"ROLE_ATHLETE", "ROLE_COACH", "ROLE_ORG_ADMIN", "ROLE_RECRUITER"};
        for (String roleName : roles) {
            String email = "test_" + roleName.toLowerCase() + "@example.com";
            // Clean up if exists
            userRepository.findByEmail(email).ifPresent(u -> userRepository.delete(u));

            RegisterRequest req = new RegisterRequest();
            req.setFull_name("User " + roleName);
            req.setEmail(email);
            req.setPassword("Password123!");
            req.setRole_name(roleName);

            System.out.println("Registering for role: " + roleName + " with email: " + email);
            mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());

            // Try logging in with email
            tryLogin(email, "Password123!", true);

            // Try logging in with full name
            tryLogin("User " + roleName, "Password123!", true);
        }
    }
}
