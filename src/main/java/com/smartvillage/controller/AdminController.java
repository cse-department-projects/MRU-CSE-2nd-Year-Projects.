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
@RequestMapping("/admin")
public class AdminController {

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

    private User getAuthenticatedAdmin(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user != null && "ADMIN".equalsIgnoreCase(user.getRole())) {
            return user;
        }
        return null;
    }

    // 1. Admin Dashboard
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        long totalCitizens = userRepository.countByRole("CITIZEN");
        long totalComplaints = complaintRepository.count();
        long pendingComplaints = complaintRepository.countByStatus("PENDING");
        long resolvedComplaints = complaintRepository.countByStatus("RESOLVED");
        long totalApplications = serviceApplicationRepository.count();
        long pendingApplications = serviceApplicationRepository.countByStatus("SUBMITTED") + serviceApplicationRepository.countByStatus("UNDER_REVIEW");

        List<Complaint> recentComplaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        if (recentComplaints.size() > 5) recentComplaints = recentComplaints.subList(0, 5);

        List<ServiceApplication> recentApplications = serviceApplicationRepository.findAllByOrderBySubmissionDateDesc();
        if (recentApplications.size() > 5) recentApplications = recentApplications.subList(0, 5);

        List<ActivityLog> recentLogs = activityLogService.getRecentLogs();
        if (recentLogs.size() > 10) recentLogs = recentLogs.subList(0, 10);

        model.addAttribute("admin", admin);
        model.addAttribute("totalCitizens", totalCitizens);
        model.addAttribute("totalComplaints", totalComplaints);
        model.addAttribute("pendingComplaints", pendingComplaints);
        model.addAttribute("resolvedComplaints", resolvedComplaints);
        model.addAttribute("totalApplications", totalApplications);
        model.addAttribute("pendingApplications", pendingApplications);
        model.addAttribute("recentComplaints", recentComplaints);
        model.addAttribute("recentApplications", recentApplications);
        model.addAttribute("recentLogs", recentLogs);

        return "admin/dashboard";
    }

    // 2. Citizen Management
    @GetMapping("/citizens")
    public String citizenManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<User> citizens = userRepository.findByRole("CITIZEN");

        model.addAttribute("admin", admin);
        model.addAttribute("citizens", citizens);
        model.addAttribute("newUser", new User());
        return "admin/citizens";
    }

    @PostMapping("/citizens/add")
    public String addCitizen(@ModelAttribute User citizen, HttpServletRequest request, RedirectAttributes redirectAttributes) {
        if (userRepository.findByUsername(citizen.getUsername()).isPresent()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Username already exists!");
            return "redirect:/admin/citizens";
        }
        citizen.setRole("CITIZEN");
        citizen.setStatus("ACTIVE");
        userRepository.save(citizen);

        String details = String.format("Admin created citizen: FullName='%s', Username='%s', Phone='%s', Ward='%s', Aadhaar='%s', RationCard='%s', Occupation='%s'",
            citizen.getFullName(), citizen.getUsername(), citizen.getPhone(), citizen.getWardNumber(), citizen.getAadhaar(), citizen.getRationCard(), citizen.getOccupation());
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_CITIZEN", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "New citizen added successfully!");
        return "redirect:/admin/citizens";
    }

    // 3. Complaint Management
    @GetMapping("/complaints")
    public String complaintManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("complaints", complaints);
        return "admin/complaints";
    }

    @PostMapping("/complaints/update")
    public String updateComplaintStatus(@RequestParam("id") Long id,
                                        @RequestParam("status") String status,
                                        @RequestParam("assignedOfficer") String assignedOfficer,
                                        @RequestParam("adminRemarks") String adminRemarks,
                                        HttpServletRequest request,
                                        RedirectAttributes redirectAttributes) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint != null) {
            complaint.setStatus(status);
            complaint.setAssignedOfficer(assignedOfficer);
            complaint.setAdminRemarks(adminRemarks);
            complaint.setUpdatedAt(LocalDateTime.now());
            complaintRepository.save(complaint);

            String details = String.format("Admin updated complaint Ticket='%s': Status='%s', AssignedOfficer='%s', Remarks='%s'",
                complaint.getTicketNo(), status, assignedOfficer, adminRemarks);
            activityLogService.log("admin", "ADMIN", "ADMIN_UPDATE_COMPLAINT", details, request);

            redirectAttributes.addFlashAttribute("successMessage", "Complaint ticket " + complaint.getTicketNo() + " updated!");
        }
        return "redirect:/admin/complaints";
    }

    // 4. Service / Application Management
    @GetMapping("/applications")
    public String applicationManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<ServiceApplication> applications = serviceApplicationRepository.findAllByOrderBySubmissionDateDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("applications", applications);
        return "admin/applications";
    }

    @PostMapping("/applications/update")
    public String updateApplicationStatus(@RequestParam("id") Long id,
                                          @RequestParam("status") String status,
                                          @RequestParam("remarks") String remarks,
                                          HttpServletRequest request,
                                          RedirectAttributes redirectAttributes) {
        ServiceApplication app = serviceApplicationRepository.findById(id).orElse(null);
        if (app != null) {
            app.setStatus(status);
            app.setRemarks(remarks);
            serviceApplicationRepository.save(app);

            String details = String.format("Admin updated application AppNumber='%s' (%s): Status='%s', Remarks='%s'",
                app.getAppNumber(), app.getServiceName(), status, remarks);
            activityLogService.log("admin", "ADMIN", "ADMIN_UPDATE_APPLICATION", details, request);

            redirectAttributes.addFlashAttribute("successMessage", "Application " + app.getAppNumber() + " status updated!");
        }
        return "redirect:/admin/applications";
    }

    // 5. Agriculture Management
    @GetMapping("/agriculture")
    public String agricultureManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<CropPrice> crops = cropPriceRepository.findAllByOrderByCropNameAsc();
        List<SoilTestRequest> soilRequests = soilTestRequestRepository.findAllByOrderByCreatedAtDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("crops", crops);
        model.addAttribute("soilRequests", soilRequests);
        return "admin/agriculture";
    }

    @PostMapping("/crop-price/add")
    public String addCropPrice(@RequestParam("cropName") String cropName,
                               @RequestParam("category") String category,
                               @RequestParam("pricePerQuintal") BigDecimal pricePerQuintal,
                               @RequestParam("minPrice") BigDecimal minPrice,
                               @RequestParam("maxPrice") BigDecimal maxPrice,
                               @RequestParam("trend") String trend,
                               HttpServletRequest request,
                               RedirectAttributes redirectAttributes) {
        CropPrice price = new CropPrice(cropName, category, pricePerQuintal, minPrice, maxPrice, trend);
        cropPriceRepository.save(price);

        String details = String.format("Admin added Mandi crop price: Crop='%s', Price=Rs.%s/quintal, Trend='%s'",
            cropName, pricePerQuintal, trend);
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_CROP", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Mandi crop price for " + cropName + " added!");
        return "redirect:/admin/agriculture";
    }

    @PostMapping("/soil-test/update")
    public String updateSoilTestStatus(@RequestParam("id") Long id,
                                       @RequestParam("status") String status,
                                       @RequestParam("resultSummary") String resultSummary,
                                       HttpServletRequest request,
                                       RedirectAttributes redirectAttributes) {
        SoilTestRequest req = soilTestRequestRepository.findById(id).orElse(null);
        if (req != null) {
            req.setStatus(status);
            req.setResultSummary(resultSummary);
            soilTestRequestRepository.save(req);

            String details = String.format("Admin updated soil test ReqNumber='%s': Status='%s', Summary='%s'",
                req.getReqNumber(), status, resultSummary);
            activityLogService.log("admin", "ADMIN", "ADMIN_UPDATE_SOIL_TEST", details, request);

            redirectAttributes.addFlashAttribute("successMessage", "Soil test request " + req.getReqNumber() + " updated!");
        }
        return "redirect:/admin/agriculture";
    }

    // 6. Utilities Management
    @GetMapping("/utilities")
    public String utilitiesManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<UtilitySchedule> utilities = utilityScheduleRepository.findAllByOrderByCreatedAtDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("utilities", utilities);
        return "admin/utilities";
    }

    @PostMapping("/utilities/add")
    public String addUtilitySchedule(@RequestParam("utilityType") String utilityType,
                                     @RequestParam("title") String title,
                                     @RequestParam("areaAffected") String areaAffected,
                                     @RequestParam("scheduleDate") String scheduleDate,
                                     @RequestParam("status") String status,
                                     @RequestParam("details") String details,
                                     HttpServletRequest request,
                                     RedirectAttributes redirectAttributes) {
        UtilitySchedule us = new UtilitySchedule(utilityType, title, areaAffected, scheduleDate, status, details);
        utilityScheduleRepository.save(us);

        String logDetails = String.format("Admin created utility schedule: Type='%s', Title='%s', Area='%s', Date='%s'",
            utilityType, title, areaAffected, scheduleDate);
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_UTILITY", logDetails, request);

        redirectAttributes.addFlashAttribute("successMessage", "Utility schedule notice created!");
        return "redirect:/admin/utilities";
    }

    // 7. Village News & Announcements
    @GetMapping("/news")
    public String newsManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<Announcement> newsList = announcementRepository.findAllByOrderByPostedDateDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("newsList", newsList);
        return "admin/news";
    }

    @PostMapping("/news/add")
    public String addAnnouncement(@RequestParam("title") String title,
                                  @RequestParam("category") String category,
                                  @RequestParam("priority") String priority,
                                  @RequestParam("content") String content,
                                  @RequestParam("targetAudience") String targetAudience,
                                  HttpServletRequest request,
                                  RedirectAttributes redirectAttributes) {
        Announcement announcement = new Announcement(title, category, priority, content, targetAudience);
        announcementRepository.save(announcement);

        String details = String.format("Admin posted announcement: Title='%s', Category='%s', Priority='%s', Audience='%s'",
            title, category, priority, targetAudience);
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_ANNOUNCEMENT", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Village news announcement published!");
        return "redirect:/admin/news";
    }

    // 8. Reports & Analytics
    @GetMapping("/reports")
    public String reportsAndAnalytics(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        model.addAttribute("admin", admin);
        model.addAttribute("totalCitizens", userRepository.countByRole("CITIZEN"));
        model.addAttribute("pendingComplaints", complaintRepository.countByStatus("PENDING"));
        model.addAttribute("inProgressComplaints", complaintRepository.countByStatus("IN_PROGRESS"));
        model.addAttribute("resolvedComplaints", complaintRepository.countByStatus("RESOLVED"));
        model.addAttribute("rejectedComplaints", complaintRepository.countByStatus("REJECTED"));
        model.addAttribute("totalApplications", serviceApplicationRepository.count());
        model.addAttribute("approvedApplications", serviceApplicationRepository.countByStatus("APPROVED"));
        model.addAttribute("recentLogs", activityLogService.getRecentLogs());
        return "admin/reports";
    }

    // 9. Emergency & Important Notices
    @GetMapping("/emergency")
    public String emergencyManagement(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        List<EmergencyContact> contacts = emergencyContactRepository.findAllByOrderByCategoryAsc();
        List<EmergencyAlert> alerts = emergencyAlertRepository.findAllByOrderByBroadcastDateDesc();

        model.addAttribute("admin", admin);
        model.addAttribute("contacts", contacts);
        model.addAttribute("alerts", alerts);
        return "admin/emergency";
    }

    @PostMapping("/emergency/alert/add")
    public String addEmergencyAlert(@RequestParam("alertTitle") String alertTitle,
                                    @RequestParam("severity") String severity,
                                    @RequestParam("message") String message,
                                    HttpServletRequest request,
                                    RedirectAttributes redirectAttributes) {
        EmergencyAlert alert = new EmergencyAlert(alertTitle, severity, message);
        emergencyAlertRepository.save(alert);

        String details = String.format("Admin posted emergency alert: Title='%s', Severity='%s'", alertTitle, severity);
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_ALERT", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Emergency SOS broadcast alert posted!");
        return "redirect:/admin/emergency";
    }

    @PostMapping("/emergency/contact/add")
    public String addEmergencyContact(@RequestParam("category") String category,
                                      @RequestParam("name") String name,
                                      @RequestParam("designation") String designation,
                                      @RequestParam("phone") String phone,
                                      @RequestParam("altPhone") String altPhone,
                                      @RequestParam("email") String email,
                                      @RequestParam("location") String location,
                                      HttpServletRequest request,
                                      RedirectAttributes redirectAttributes) {
        EmergencyContact contact = new EmergencyContact(category, name, designation, phone, altPhone, email, location);
        emergencyContactRepository.save(contact);

        String details = String.format("Admin added emergency contact: Name='%s', Category='%s', Phone='%s'", name, category, phone);
        activityLogService.log("admin", "ADMIN", "ADMIN_ADD_CONTACT", details, request);

        redirectAttributes.addFlashAttribute("successMessage", "Emergency helpline contact added!");
        return "redirect:/admin/emergency";
    }

    // 10. Audit & Activity Logs
    @GetMapping("/logs")
    public String viewActivityLogs(HttpSession session, Model model) {
        User admin = getAuthenticatedAdmin(session);
        if (admin == null) return "redirect:/login?role=ADMIN";

        model.addAttribute("admin", admin);
        model.addAttribute("logs", activityLogService.getAllLogs());
        return "admin/reports";
    }
}
