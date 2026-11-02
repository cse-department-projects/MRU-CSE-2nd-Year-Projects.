package com.athletehub.api;

import com.athletehub.api.entity.*;
import com.athletehub.api.entity.enums.*;
import com.athletehub.api.repository.*;
import com.athletehub.api.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class IsolationAccessControlTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationTypeRepository organizationTypeRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private CoachAssignmentRepository coachAssignmentRepository;

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Test Data Identifiers
    private Organization orgMru;
    private Organization orgAbc;

    private Sport sportAthletics;
    private Sport sportCricket;

    private User userSuperAdmin;
    private User userMruAdmin;
    private User userAbcAdmin;
    private User userCoachRavi;
    private User userCoachSuresh;
    private User userCoachKumar;
    private User userAthleteAnanya;
    private User userAthleteArjun;
    private User userAthletePriya;

    private Coach coachRavi;
    private Coach coachSuresh;
    private Coach coachKumar;

    private Athlete athleteAnanya;
    private Athlete athleteArjun;
    private Athlete athletePriya;

    private String tokenSuperAdmin;
    private String tokenMruAdmin;
    private String tokenAbcAdmin;
    private String tokenCoachRavi;
    private String tokenCoachSuresh;
    private String tokenCoachKumar;
    private String tokenAthleteAnanya;
    private String tokenAthleteArjun;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        // Fetch or Create Roles
        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("SUPER_ADMIN");
                    return roleRepository.save(r);
                });
        Role orgAdminRole = roleRepository.findByName("ROLE_ORG_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_ORG_ADMIN");
                    return roleRepository.save(r);
                });
        Role coachRole = roleRepository.findByName("COACH")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("COACH");
                    return roleRepository.save(r);
                });
        Role athleteRole = roleRepository.findByName("ATHLETE")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ATHLETE");
                    return roleRepository.save(r);
                });

        // Organization Type
        OrganizationType orgType = organizationTypeRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    OrganizationType t = new OrganizationType();
                    t.setName("University");
                    return organizationTypeRepository.save(t);
                });

        // 1. Organization A: MRU
        orgMru = new Organization();
        orgMru.setOrganizationCode("MRU-" + suffix);
        orgMru.setName("MRU University " + suffix);
        orgMru.setEmail("mru-" + suffix + "@test.edu");
        orgMru.setPhone("1234567890");
        orgMru.setAddressLine("Campus 1");
        orgMru.setCity("Hyderabad");
        orgMru.setState("Telangana");
        orgMru.setCountry("India");
        orgMru.setPostalCode("500001");
        orgMru.setOrganizationType(orgType);
        orgMru = organizationRepository.save(orgMru);

        // 2. Organization B: ABC College
        orgAbc = new Organization();
        orgAbc.setOrganizationCode("ABC-" + suffix);
        orgAbc.setName("ABC College " + suffix);
        orgAbc.setEmail("abc-" + suffix + "@test.edu");
        orgAbc.setPhone("0987654321");
        orgAbc.setAddressLine("Campus 2");
        orgAbc.setCity("Bengaluru");
        orgAbc.setState("Karnataka");
        orgAbc.setCountry("India");
        orgAbc.setPostalCode("560001");
        orgAbc.setOrganizationType(orgType);
        orgAbc = organizationRepository.save(orgAbc);

        // Sports
        sportAthletics = new Sport();
        sportAthletics.setName("Athletics-" + suffix);
        sportAthletics.setCategory("Track & Field");
        sportAthletics = sportRepository.save(sportAthletics);

        sportCricket = new Sport();
        sportCricket.setName("Cricket-" + suffix);
        sportCricket.setCategory("Team Sport");
        sportCricket = sportRepository.save(sportCricket);

        // Users
        userSuperAdmin = createUser("super_" + suffix + "@test.com", "Super Admin", superAdminRole, null);
        userMruAdmin = createUser("mru_admin_" + suffix + "@test.com", "MRU Admin", orgAdminRole, orgMru);
        userAbcAdmin = createUser("abc_admin_" + suffix + "@test.com", "ABC Admin", orgAdminRole, orgAbc);

        userCoachRavi = createUser("ravi_" + suffix + "@test.com", "Ravi", coachRole, orgMru);
        userCoachSuresh = createUser("suresh_" + suffix + "@test.com", "Suresh", coachRole, orgMru);
        userCoachKumar = createUser("kumar_" + suffix + "@test.com", "Kumar", coachRole, orgAbc);

        userAthleteAnanya = createUser("ananya_" + suffix + "@test.com", "Ananya", athleteRole, orgMru);
        userAthleteArjun = createUser("arjun_" + suffix + "@test.com", "Arjun", athleteRole, orgMru);
        userAthletePriya = createUser("priya_" + suffix + "@test.com", "Priya", athleteRole, orgAbc);

        // Coaches
        coachRavi = createCoach(userCoachRavi, "Ravi", "Verma", orgMru.getId(), "Athletics-" + suffix, "COA-R-" + suffix);
        coachSuresh = createCoach(userCoachSuresh, "Suresh", "Raina", orgMru.getId(), "Cricket-" + suffix, "COA-S-" + suffix);
        coachKumar = createCoach(userCoachKumar, "Kumar", "Sanu", orgAbc.getId(), "Athletics-" + suffix, "COA-K-" + suffix);

        // Athletes
        athleteAnanya = createAthlete(userAthleteAnanya, "Ananya", "Sharma", orgMru.getId(), sportAthletics, "ATH-A-" + suffix);
        athleteArjun = createAthlete(userAthleteArjun, "Arjun", "Patel", orgMru.getId(), sportCricket, "ATH-B-" + suffix);
        athletePriya = createAthlete(userAthletePriya, "Priya", "Nair", orgAbc.getId(), sportAthletics, "ATH-P-" + suffix);

        // Coach Assignments
        createAssignment(coachRavi, athleteAnanya, orgMru, "ASG-R-" + suffix);
        createAssignment(coachSuresh, athleteArjun, orgMru, "ASG-S-" + suffix);
        createAssignment(coachKumar, athletePriya, orgAbc, "ASG-K-" + suffix);

        // Performance Records
        createPerformanceRecord(athleteAnanya, sportAthletics, "100m Sprint", 11.42, "seconds", "PRF-A-" + suffix);
        createPerformanceRecord(athleteArjun, sportCricket, "Batting Strike Rate", 138.5, "rate", "PRF-B-" + suffix);
        createPerformanceRecord(athletePriya, sportAthletics, "200m Sprint", 23.85, "seconds", "PRF-P-" + suffix);

        // Generate JWT Tokens
        tokenSuperAdmin = jwtUtil.generateAccessToken(userSuperAdmin.getId().toString());
        tokenMruAdmin = jwtUtil.generateAccessToken(userMruAdmin.getId().toString());
        tokenAbcAdmin = jwtUtil.generateAccessToken(userAbcAdmin.getId().toString());
        tokenCoachRavi = jwtUtil.generateAccessToken(userCoachRavi.getId().toString());
        tokenCoachSuresh = jwtUtil.generateAccessToken(userCoachSuresh.getId().toString());
        tokenCoachKumar = jwtUtil.generateAccessToken(userCoachKumar.getId().toString());
        tokenAthleteAnanya = jwtUtil.generateAccessToken(userAthleteAnanya.getId().toString());
        tokenAthleteArjun = jwtUtil.generateAccessToken(userAthleteArjun.getId().toString());
    }

    private User createUser(String email, String fullName, Role role, Organization org) {
        User u = new User();
        u.setEmail(email);
        u.setFullName(fullName);
        u.setPasswordHash(passwordEncoder.encode("Password123!"));
        u.setRole(role);
        u.setOrganization(org);
        u.setStatus("Active");
        return userRepository.save(u);
    }

    private Coach createCoach(User user, String firstName, String lastName, Integer orgId, String specialization, String coachCode) {
        Coach c = new Coach();
        c.setUserId(user.getId());
        c.setCoachCode(coachCode);
        c.setFirstName(firstName);
        c.setLastName(lastName);
        c.setEmail(user.getEmail());
        c.setGender(Gender.MALE);
        c.setDateOfBirth(LocalDate.of(1985, 5, 10));
        c.setOrganizationId(orgId);
        c.setSpecialization(specialization);
        c.setStatus(CoachStatus.ACTIVE);
        return coachRepository.save(c);
    }

    private Athlete createAthlete(User user, String firstName, String lastName, Integer orgId, Sport sport, String athleteCode) {
        Athlete a = new Athlete();
        a.setUserId(user.getId());
        a.setAthleteCode(athleteCode);
        a.setFirstName(firstName);
        a.setLastName(lastName);
        a.setDateOfBirth(LocalDate.of(2003, 1, 15));
        a.setGender("Female");
        a.setOrganizationId(orgId);
        a.setSport(sport);
        a.setStatus("Active");
        return athleteRepository.save(a);
    }

    private CoachAssignment createAssignment(Coach coach, Athlete athlete, Organization org, String code) {
        CoachAssignment ca = new CoachAssignment();
        ca.setCoach(coach);
        ca.setAthlete(athlete);
        ca.setOrganization(org);
        ca.setAssignmentCode(code);
        ca.setStartDate(LocalDate.now().minusMonths(1));
        ca.setStatus(AssignmentStatus.ACTIVE);
        return coachAssignmentRepository.save(ca);
    }

    private PerformanceRecord createPerformanceRecord(Athlete athlete, Sport sport, String metric, Double value, String unit, String code) {
        PerformanceRecord r = new PerformanceRecord();
        r.setAthlete(athlete);
        r.setSport(sport);
        r.setMetricName(metric);
        r.setMetricValue(value);
        r.setUnit(unit);
        r.setRecordCode(code);
        r.setRecordDate(LocalDate.now());
        r.setContext(RecordContext.COMPETITION);
        return performanceRecordRepository.save(r);
    }

    // ==========================================
    // 1. ORGANIZATIONS ISOLATION TESTS
    // ==========================================

    @Test
    @DisplayName("MRU Org Admin sees only MRU organization and not ABC College")
    void testMruAdminOrganizationIsolation() throws Exception {
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(orgMru.getId()))
                .andExpect(jsonPath("$.data[0].name").value(orgMru.getName()));

        // Accessing own organization details directly -> 200 OK
        mockMvc.perform(get("/api/v1/organizations/" + orgMru.getId())
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(orgMru.getId()));

        // Tampering URL to access ABC College -> 403 Forbidden
        mockMvc.perform(get("/api/v1/organizations/" + orgAbc.getId())
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ABC College Admin sees only ABC College organization")
    void testAbcAdminOrganizationIsolation() throws Exception {
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenAbcAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(orgAbc.getId()));

        // Tampering URL to access MRU -> 403 Forbidden
        mockMvc.perform(get("/api/v1/organizations/" + orgMru.getId())
                        .header("Authorization", "Bearer " + tokenAbcAdmin))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Coaches and Athletes are forbidden from accessing organization list")
    void testCoachAndAthleteCannotAccessOrganizationsList() throws Exception {
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 2. ORG ADMIN ATHLETE & COACH SCOPING
    // ==========================================

    @Test
    @DisplayName("MRU Admin sees only MRU athletes and coaches, and can filter by sport")
    void testMruAdminSeesOnlyMruMembersAndFiltersBySport() throws Exception {
        // Athletes list: Sees Ananya and Arjun, but NOT Priya
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItems(athleteAnanya.getId(), athleteArjun.getId())))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(athletePriya.getId()))));

        // Filter MRU athletes by Athletics sport -> only Ananya
        mockMvc.perform(get("/api/v1/athletes")
                        .param("sport_id", sportAthletics.getId().toString())
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(athleteAnanya.getId())))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(athleteArjun.getId()))));

        // Filter MRU athletes by Cricket sport -> only Arjun
        mockMvc.perform(get("/api/v1/athletes")
                        .param("sport_id", sportCricket.getId().toString())
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(athleteArjun.getId())))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(athleteAnanya.getId()))));

        // Coaches list: Sees Ravi and Suresh, but NOT Kumar
        mockMvc.perform(get("/api/v1/coaches")
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItems(coachRavi.getId(), coachSuresh.getId())))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(coachKumar.getId()))));

        // Filter MRU coaches by Athletics sport -> only Ravi
        mockMvc.perform(get("/api/v1/coaches")
                        .param("sport_id", sportAthletics.getId().toString())
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(coachRavi.getId())))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(coachSuresh.getId()))));
    }

    // ==========================================
    // 3. COACH SPORT & ASSIGNMENT SEPARATION
    // ==========================================

    @Test
    @DisplayName("Athletics Coach Ravi sees only assigned Athletics athlete Ananya, not Arjun or Priya")
    void testCoachRaviAssignmentIsolation() throws Exception {
        // List athletes: only Ananya
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(athleteAnanya.getId()));

        // Access Ananya directly -> 200 OK
        mockMvc.perform(get("/api/v1/athletes/" + athleteAnanya.getId())
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(athleteAnanya.getId()));

        // URL Tampering: Ravi trying to access Arjun (Cricket, MRU) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athleteArjun.getId())
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isForbidden());

        // URL Tampering: Ravi trying to access Priya (Athletics, ABC College) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athletePriya.getId())
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cricket Coach Suresh sees only assigned Cricket athlete Arjun, not Ananya or Priya")
    void testCoachSureshAssignmentIsolation() throws Exception {
        // List athletes: only Arjun
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenCoachSuresh))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(athleteArjun.getId()));

        // URL Tampering: Suresh trying to access Ananya (Athletics, MRU) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athleteAnanya.getId())
                        .header("Authorization", "Bearer " + tokenCoachSuresh))
                .andExpect(status().isForbidden());

        // URL Tampering: Suresh trying to access Priya (ABC College) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athletePriya.getId())
                        .header("Authorization", "Bearer " + tokenCoachSuresh))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Coach Kumar from ABC College sees only Priya and cannot access MRU athletes")
    void testCoachKumarIsolation() throws Exception {
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenCoachKumar))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(athletePriya.getId()));

        // Tampering URL to access Ananya -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athleteAnanya.getId())
                        .header("Authorization", "Bearer " + tokenCoachKumar))
                .andExpect(status().isForbidden());

        // Tampering URL to access Arjun -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athleteArjun.getId())
                        .header("Authorization", "Bearer " + tokenCoachKumar))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 4. ATHLETE PRIVACY ENFORCEMENT
    // ==========================================

    @Test
    @DisplayName("Athlete Ananya can only access her own profile and performance records")
    void testAthleteAnanyaPrivacy() throws Exception {
        // Ananya listing athletes sees only herself
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(athleteAnanya.getId()));

        // Accessing own profile -> 200 OK
        mockMvc.perform(get("/api/v1/athletes/" + athleteAnanya.getId())
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(athleteAnanya.getId()));

        // URL Tampering: Ananya accessing Arjun's profile -> 403 Forbidden
        mockMvc.perform(get("/api/v1/athletes/" + athleteArjun.getId())
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isForbidden());

        // Accessing own performance records -> 200 OK
        mockMvc.perform(get("/api/v1/performance-records/athlete/" + athleteAnanya.getId())
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isOk());

        // URL Tampering: Ananya accessing Arjun's performance records -> 403 Forbidden
        mockMvc.perform(get("/api/v1/performance-records/athlete/" + athleteArjun.getId())
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isForbidden());
    }

    // ==========================================
    // 5. SUPER ADMIN GLOBAL ACCESS
    // ==========================================

    @Test
    @DisplayName("Super Admin retains platform-wide access across all organizations and sports")
    void testSuperAdminGlobalAccess() throws Exception {
        // Super Admin sees all organizations
        mockMvc.perform(get("/api/v1/organizations")
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItems(orgMru.getId(), orgAbc.getId())));

        // Super Admin sees all athletes
        mockMvc.perform(get("/api/v1/athletes")
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItems(athleteAnanya.getId(), athleteArjun.getId(), athletePriya.getId())));

        // Super Admin sees all coaches
        mockMvc.perform(get("/api/v1/coaches")
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItems(coachRavi.getId(), coachSuresh.getId(), coachKumar.getId())));
    }

    // ==========================================
    // 6. DASHBOARD COUNTS ISOLATION
    // ==========================================

    @Test
    @DisplayName("Dashboard stats are properly scoped by tenant organization")
    void testDashboardStatsIsolation() throws Exception {
        // MRU Admin dashboard stats: total_organizations = 1
        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.total_organizations").value(1));

        // Super Admin dashboard stats: total_organizations includes all
        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.total_organizations", greaterThanOrEqualTo(2)));
    }

    @Test
    @DisplayName("Training dashboard stats are returned successfully for all roles")
    void testTrainingDashboardStats() throws Exception {
        // Super Admin
        mockMvc.perform(get("/api/v1/training-dashboard/stats")
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.trainingPlans").exists());

        // Org Admin
        mockMvc.perform(get("/api/v1/training-dashboard/stats")
                        .header("Authorization", "Bearer " + tokenMruAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.trainingPlans").exists());

        // Coach
        mockMvc.perform(get("/api/v1/training-dashboard/stats")
                        .header("Authorization", "Bearer " + tokenCoachRavi))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.trainingPlans").exists());

        // Athlete
        mockMvc.perform(get("/api/v1/training-dashboard/stats")
                        .header("Authorization", "Bearer " + tokenAthleteAnanya))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.trainingPlans").exists());
    }
}
