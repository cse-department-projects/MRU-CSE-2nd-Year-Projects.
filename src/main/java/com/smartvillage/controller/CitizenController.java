package com.smartvillage.controller;

import com.smartvillage.model.*;
import com.smartvillage.repository.*;
import com.smartvillage.service.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/citizen")
public class CitizenController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ServiceApplicationRepository serviceApplicationRepository;

    @Autowired
    private CropPriceRepository cropPriceRepository;

    @Autowired
    private SoilTestRequestRepository soilTestRequestRepository;

    @Autowired
    private UtilityScheduleRepository utilityScheduleRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyAlertRepository emergencyAlertRepository;

    @Autowired
    private ActivityLogService activityLogService;

    private User getAuthenticatedCitizen(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user != null && "CITIZEN".equalsIgnoreCase(user.getRole())) {
            // Refresh from DB to get updated info
            return userRepository.findById(user.getId()).orElse(user);
        }
        return null;
    }

    // 1. Citizen Dashboard
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<Complaint> myComplaints = complaintRepository.findByUserOrderByCreatedAtDesc(citizen);
        List<ServiceApplication> myApplications = serviceApplicationRepository.findByUserOrderBySubmissionDateDesc(citizen);
        List<Announcement> announcements = announcementRepository.findByActiveTrueOrderByPostedDateDesc();
        List<EmergencyAlert> alerts = emergencyAlertRepository.findByActiveTrueOrderByBroadcastDateDesc();
        List<UtilitySchedule> utilities = utilityScheduleRepository.findAllByOrderByCreatedAtDesc();

        long pendingComplaints = myComplaints.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long resolvedComplaints = myComplaints.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();

        model.addAttribute("user", citizen);
        model.addAttribute("myComplaints", myComplaints);
        model.addAttribute("myApplications", myApplications);
        model.addAttribute("announcements", announcements);
        model.addAttribute("alerts", alerts);
        model.addAttribute("utilities", utilities);
        model.addAttribute("pendingComplaintsCount", pendingComplaints);
        model.addAttribute("resolvedComplaintsCount", resolvedComplaints);
        model.addAttribute("activeApplicationsCount", myApplications.size());

        return "citizen/dashboard";
    }

    // 2. My Profile
    @GetMapping("/profile")
    public String profile(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        model.addAttribute("user", citizen);
        return "citizen/profile";
    }

    @PostMapping("/profile/update")
    public String updateProfile(@ModelAttribute User updatedUser, HttpSession session, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        citizen.setFullName(updatedUser.getFullName());
        citizen.setEmail(updatedUser.getEmail());
        citizen.setPhone(updatedUser.getPhone());
        citizen.setAadhaar(updatedUser.getAadhaar());
        citizen.setRationCard(updatedUser.getRationCard());
        citizen.setWardNumber(updatedUser.getWardNumber());
        citizen.setAddress(updatedUser.getAddress());
        citizen.setOccupation(updatedUser.getOccupation());
        citizen.setHouseholdMembers(updatedUser.getHouseholdMembers());

        userRepository.save(citizen);
        session.setAttribute("loggedInUser", citizen);

        String details = String.format("Updated profile: FullName='%s', Phone='%s', Email='%s', Aadhaar='%s', Ward='%s', Occupation='%s', Address='%s'",
            citizen.getFullName(), citizen.getPhone(), citizen.getEmail(), citizen.getAadhaar(), citizen.getWardNumber(), citizen.getOccupation(), citizen.getAddress());
        activityLogService.log(citizen.getUsername(), "CITIZEN", "UPDATE_PROFILE", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Profile details updated successfully!");
        return "redirect:/citizen/profile";
    }

    // 3. Government / Rural Services
    @GetMapping("/services")
    public String services(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<ServiceApplication> myApplications = serviceApplicationRepository.findByUserOrderBySubmissionDateDesc(citizen);

        model.addAttribute("user", citizen);
        model.addAttribute("myApplications", myApplications);
        return "citizen/services";
    }

    @PostMapping("/services/apply")
    public String applyService(@RequestParam("serviceName") String serviceName,
                               @RequestParam("category") String category,
                               @RequestParam("description") String description,
                               HttpSession session, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        ServiceApplication app = new ServiceApplication();
        app.setAppNumber("APP-" + System.currentTimeMillis() % 1000000);
        app.setUser(citizen);
        app.setServiceName(serviceName);
        app.setCategory(category);
        app.setDescription(description);
        app.setStatus("SUBMITTED");

        serviceApplicationRepository.save(app);

        String details = String.format("Submitted scheme application: AppNumber='%s', Service='%s', Category='%s', Applicant='%s' (%s)",
            app.getAppNumber(), app.getServiceName(), app.getCategory(), citizen.getFullName(), citizen.getUsername());
        activityLogService.log(citizen.getUsername(), "CITIZEN", "APPLY_SERVICE", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Application " + app.getAppNumber() + " submitted successfully!");
        return "redirect:/citizen/services";
    }

    // 4. Report a Problem / Complaint
    @GetMapping("/complaints/new")
    public String newComplaintForm(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        model.addAttribute("user", citizen);
        return "citizen/complaints_new";
    }

    @PostMapping("/complaints/save")
    public String saveComplaint(@RequestParam("title") String title,
                                @RequestParam("category") String category,
                                @RequestParam("description") String description,
                                @RequestParam("location") String location,
                                @RequestParam("wardNumber") String wardNumber,
                                @RequestParam("priority") String priority,
                                HttpSession session, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        Complaint complaint = new Complaint();
        complaint.setTicketNo("TKT-" + System.currentTimeMillis() % 1000000);
        complaint.setUser(citizen);
        complaint.setTitle(title);
        complaint.setCategory(category);
        complaint.setDescription(description);
        complaint.setLocation(location);
        complaint.setWardNumber(wardNumber);
        complaint.setPriority(priority);
        complaint.setStatus("PENDING");

        complaintRepository.save(complaint);

        String details = String.format("Registered complaint ticket: Ticket='%s', Title='%s', Category='%s', Ward='%s', Priority='%s', Location='%s'",
            complaint.getTicketNo(), complaint.getTitle(), complaint.getCategory(), complaint.getWardNumber(), complaint.getPriority(), complaint.getLocation());
        activityLogService.log(citizen.getUsername(), "CITIZEN", "FILE_COMPLAINT", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Complaint Ticket " + complaint.getTicketNo() + " registered successfully!");
        return "redirect:/citizen/status";
    }

    // 5. Complaints & Application Status
    @GetMapping("/status")
    public String complaintAndAppStatus(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<Complaint> complaints = complaintRepository.findByUserOrderByCreatedAtDesc(citizen);
        List<ServiceApplication> applications = serviceApplicationRepository.findByUserOrderBySubmissionDateDesc(citizen);

        model.addAttribute("user", citizen);
        model.addAttribute("complaints", complaints);
        model.addAttribute("applications", applications);
        return "citizen/status";
    }

    // 6. Agriculture & Farming Services
    @GetMapping("/agriculture")
    public String agricultureServices(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<CropPrice> crops = cropPriceRepository.findAllByOrderByCropNameAsc();
        List<SoilTestRequest> soilRequests = soilTestRequestRepository.findByUserOrderByCreatedAtDesc(citizen);

        model.addAttribute("user", citizen);
        model.addAttribute("crops", crops);
        model.addAttribute("soilRequests", soilRequests);
        return "citizen/agriculture";
    }

    @PostMapping("/soil-test/save")
    public String requestSoilTest(@RequestParam("farmerName") String farmerName,
                                  @RequestParam("landAreaAcres") BigDecimal landAreaAcres,
                                  @RequestParam("surveyNumber") String surveyNumber,
                                  @RequestParam("sampleLocation") String sampleLocation,
                                  HttpSession session, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        SoilTestRequest req = new SoilTestRequest();
        req.setReqNumber("SOIL-" + System.currentTimeMillis() % 100000);
        req.setUser(citizen);
        req.setFarmerName(farmerName);
        req.setLandAreaAcres(landAreaAcres);
        req.setSurveyNumber(surveyNumber);
        req.setSampleLocation(sampleLocation);
        req.setStatus("REQUESTED");

        soilTestRequestRepository.save(req);

        String details = String.format("Soil test requested: ReqNumber='%s', Farmer='%s', LandArea=%s acres, SurveyNo='%s', Location='%s'",
            req.getReqNumber(), req.getFarmerName(), req.getLandAreaAcres(), req.getSurveyNumber(), req.getSampleLocation());
        activityLogService.log(citizen.getUsername(), "CITIZEN", "REQUEST_SOIL_TEST", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Soil testing request " + req.getReqNumber() + " registered!");
        return "redirect:/citizen/agriculture";
    }

    // 7. Village News & Announcements
    @GetMapping("/news")
    public String newsAnnouncements(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<Announcement> announcements = announcementRepository.findByActiveTrueOrderByPostedDateDesc();

        model.addAttribute("user", citizen);
        model.addAttribute("announcements", announcements);
        return "citizen/news";
    }

    // 8. Utility Services – Water, Electricity & Waste
    @GetMapping("/utilities")
    public String utilities(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<UtilitySchedule> utilities = utilityScheduleRepository.findAllByOrderByCreatedAtDesc();

        model.addAttribute("user", citizen);
        model.addAttribute("utilities", utilities);
        return "citizen/utilities";
    }

    // 9. Emergency Contacts / Help
    @GetMapping("/emergency")
    public String emergencyHelp(HttpSession session, Model model) {
        User citizen = getAuthenticatedCitizen(session);
        if (citizen == null) return "redirect:/login?role=CITIZEN";

        List<EmergencyContact> contacts = emergencyContactRepository.findAllByOrderByCategoryAsc();
        List<EmergencyAlert> alerts = emergencyAlertRepository.findByActiveTrueOrderByBroadcastDateDesc();

        model.addAttribute("user", citizen);
        model.addAttribute("contacts", contacts);
        model.addAttribute("alerts", alerts);
        return "citizen/emergency";
    }
}
