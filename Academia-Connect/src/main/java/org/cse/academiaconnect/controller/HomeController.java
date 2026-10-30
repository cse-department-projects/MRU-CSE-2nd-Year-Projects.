package org.cse.academiaconnect.controller;

import org.cse.academiaconnect.service.ActivityService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.cse.academiaconnect.entity.Activity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.security.Principal;
import org.cse.academiaconnect.entity.User;
import org.cse.academiaconnect.repository.UserRepository;
import org.cse.academiaconnect.dto.CreateActivityRequest;
import org.cse.academiaconnect.service.RegistrationService;
import org.cse.academiaconnect.entity.Registration;
import org.cse.academiaconnect.entity.Waitlist;
import org.cse.academiaconnect.service.WaitlistService;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.cse.academiaconnect.entity.Feedback;
import org.cse.academiaconnect.service.FeedbackService;
import org.springframework.web.bind.annotation.RequestParam;
import org.cse.academiaconnect.service.CertificateService;
import org.cse.academiaconnect.entity.Certificate;


@Controller
public class HomeController {

    private final ActivityService activityService;
    private final RegistrationService registrationService;
    private final WaitlistService waitlistService;
    private final FeedbackService feedbackService;
    private final CertificateService certificateService;
private final UserRepository userRepository;

 public HomeController(
        ActivityService activityService,
        RegistrationService registrationService,
        WaitlistService waitlistService,
        FeedbackService feedbackService,
        CertificateService certificateService,
        UserRepository userRepository) {

    this.activityService = activityService;
    this.registrationService = registrationService;
    this.waitlistService = waitlistService;
    this.feedbackService = feedbackService;
    this.certificateService = certificateService;
    this.userRepository = userRepository;
}

    @GetMapping("/")
    public String home() {
        return "index";
    }
    
    @GetMapping("/activities")
    public String activities(Model model) {
        model.addAttribute("activities", activityService.getAllActivities());
        return "activities";
    }

@GetMapping("/activities/{id}")
public String activityDetails(@PathVariable Long id,
                              Model model) {

    model.addAttribute("activity", activityService.getActivityById(id));

    return "activity-details";
}

    @GetMapping("/dashboard")
public String userDashboard() {
    return "dashboard";
}
@GetMapping("/organizer")
public String organizerDashboard(
        Model model,
        Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Long organizerId = organizer.getId();

    model.addAttribute(
            "totalActivities",
            activityService.countActivitiesByOrganizer(organizerId)
    );

    model.addAttribute(
            "totalRegistrations",
            registrationService.countRegistrationsByOrganizer(organizerId)
    );

    model.addAttribute(
            "totalWaitingUsers",
            waitlistService.countWaitingUsersByOrganizer(organizerId)
    );

    model.addAttribute(
            "averageRating",
            feedbackService.getAverageRatingByOrganizer(organizerId)
    );

    return "dashboard-organizer";
}
@GetMapping("/activities/create")
public String createActivityPage(Model model) {

    model.addAttribute("activity", new CreateActivityRequest());

    return "create-activity";
}



    @GetMapping("/certificates")
    public String certificates() {
        return "certificates";
    }

    @GetMapping("/feedback")
    public String feedback() {
        return "feedback";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

   @PostMapping("/activities/create")
public String createActivity(
        @Valid @ModelAttribute("activity") CreateActivityRequest request,
        Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = new Activity();

    activity.setTitle(request.getTitle());
    activity.setDescription(request.getDescription());
    activity.setLocation(request.getLocation());
    activity.setCapacity(request.getCapacity());
    activity.setDateTime(request.getDateTime());
    activity.setRegistrationDeadline(request.getRegistrationDeadline());
    activity.setType(Activity.ActivityType.valueOf(request.getType()));
    activity.setStatus(Activity.ActivityStatus.valueOf(request.getStatus()));
    activity.setOrganizer(organizer);

    activityService.createActivity(activity);

    return "redirect:/organizer/activities";
}



@PostMapping("/activities/register/{id}")
public String registerForActivity(
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean force,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (activity.getStatus() == Activity.ActivityStatus.CANCELLED) {

    redirectAttributes.addFlashAttribute(
            "errorMessage",
            "This activity has been cancelled. Registration is not available."
    );

    return "redirect:/activities/" + id;
}

    if (registrationService.isUserRegistered(user.getId(), id)) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "You are already registered for this activity."
        );

        return "redirect:/activities/" + id;
    }

    if (registrationService.isActivityFull(id)) {

        if (waitlistService.isUserWaitlisted(user.getId(), id)) {
            redirectAttributes.addFlashAttribute(
                    "errorMessage",
                    "You are already on the waitlist for this activity."
            );

            return "redirect:/activities/" + id;
        }

        Waitlist waitlist = new Waitlist();
        waitlist.setUser(user);
        waitlist.setActivity(activity);

        Waitlist savedWaitlist = waitlistService.createWaitlist(waitlist);

        redirectAttributes.addFlashAttribute(
                "successMessage",
                "Activity is full. You were added to the waitlist at position "
                        + savedWaitlist.getQueuePosition() + "."
        );

        return "redirect:/activities/" + id;
    }

    Registration registration = new Registration();
    registration.setUser(user);
    registration.setActivity(activity);

    try {
        registrationService.createRegistration(registration, force);
    } catch (IllegalStateException exception) {

        if ("SCHEDULE_CONFLICT".equals(exception.getMessage())) {

            redirectAttributes.addFlashAttribute(
                    "conflictMessage",
                    "You are already registered for another activity at the same date and time."
            );

            redirectAttributes.addFlashAttribute(
                    "conflictActivityId",
                    id
            );

            return "redirect:/activities/" + id;
        }

        throw exception;
    }

    redirectAttributes.addFlashAttribute(
            "successMessage",
            force
                    ? "Registered successfully despite the schedule conflict."
                    : "You have successfully registered for this activity."
    );

    return "redirect:/activities/" + id;
}

@GetMapping("/my-registrations")
public String myRegistrations(Model model,
                              Principal principal) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    model.addAttribute(
            "registrations",
            registrationService.getRegistrationsByUser(user.getId())
    );

    return "my-registrations";
}

@GetMapping("/my-waitlist")
public String myWaitlist(Model model, Principal principal) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    model.addAttribute(
            "waitlistEntries",
            waitlistService.getWaitlistEntriesByUser(user.getId())
    );

    return "my-waitlist";
}
@PostMapping("/my-waitlist/cancel/{id}")
public String cancelWaitlist(
        @PathVariable Long id,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    waitlistService.cancelWaitlist(id, user.getId());

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Your waitlist entry has been cancelled."
    );

    return "redirect:/my-waitlist";
}

@PostMapping("/my-registrations/cancel/{id}")
public String cancelRegistration(
        @PathVariable Long id,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    registrationService.cancelRegistration(id, user.getId());

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Registration cancelled successfully."
    );

    return "redirect:/my-registrations";
}

@GetMapping("/organizer/activities")
public String organizerActivities(Model model, Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    model.addAttribute(
            "activities",
            activityService.getActivitiesByOrganizer(organizer.getId())
    );

    return "organizer-activities";
}
@GetMapping("/organizer/activities/{id}/participants")
public String viewParticipants(
        @PathVariable Long id,
        Model model,
        Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (!activity.getOrganizer().getId().equals(organizer.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to view participants for this activity."
        );
    }

    model.addAttribute("activity", activity);

    model.addAttribute(
            "registrations",
            registrationService.getRegistrationsByActivity(id)
    );

    model.addAttribute(
            "waitlistEntries",
            waitlistService.getWaitlistEntriesByActivity(id)
    );

    return "organizer-participants";
}

@GetMapping("/activities/{id}/feedback")
public String feedbackForm(
        @PathVariable Long id,
        Model model,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    if (!registrationService.isUserRegistered(user.getId(), id)) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "You must register for this activity before submitting feedback."
        );

        return "redirect:/my-registrations";
    }

    if (feedbackService.hasUserSubmittedFeedback(user.getId(), id)) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "You have already submitted feedback for this activity."
        );

        return "redirect:/my-registrations";
    }

    model.addAttribute("activity", activityService.getActivityById(id));

    return "feedback-form";
}

@PostMapping("/activities/{id}/feedback")
public String submitFeedback(
        @PathVariable Long id,
        @RequestParam Integer rating,
        @RequestParam(required = false) String comments,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (!registrationService.isUserRegistered(user.getId(), id)) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "You are not registered for this activity."
        );

        return "redirect:/my-registrations";
    }

    if (feedbackService.hasUserSubmittedFeedback(user.getId(), id)) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "You have already submitted feedback."
        );

        return "redirect:/my-registrations";
    }

    if (rating < 1 || rating > 5) {
        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "Rating must be between 1 and 5."
        );

        return "redirect:/activities/" + id + "/feedback";
    }

    Feedback feedback = new Feedback();
    feedback.setUser(user);
    feedback.setActivity(activity);
    feedback.setRating(rating);
    feedback.setComments(comments);

    feedbackService.createFeedback(feedback);

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Feedback submitted successfully."
    );

    return "redirect:/my-registrations";
}

@GetMapping("/organizer/activities/{id}/feedback")
public String organizerFeedback(
        @PathVariable Long id,
        Model model,
        Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (!activity.getOrganizer().getId().equals(organizer.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to view feedback for this activity."
        );
    }

    model.addAttribute("activity", activity);
    model.addAttribute(
            "feedbacks",
            feedbackService.getFeedbacksByActivity(id)
    );
    model.addAttribute(
            "averageRating",
            feedbackService.getAverageRating(id)
    );

    return "organizer-feedback";
}

@PostMapping("/organizer/registrations/{id}/attendance")
public String updateAttendance(
        @PathVariable Long id,
        @RequestParam Registration.RegistrationStatus status,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Registration registration = registrationService.getRegistrationById(id);

    if (!registration.getActivity().getOrganizer().getId()
            .equals(organizer.getId())) {

        throw new IllegalArgumentException(
                "You are not allowed to manage attendance for this activity."
        );
    }

    registrationService.updateAttendanceStatus(id, status);

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Attendance updated successfully."
    );

    return "redirect:/organizer/activities/"
            + registration.getActivity().getId()
            + "/participants";
}
@PostMapping("/organizer/registrations/{id}/certificate")
public String issueCertificate(
        @PathVariable Long id,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Registration registration = registrationService.getRegistrationById(id);

    if (!registration.getActivity().getOrganizer().getId()
            .equals(organizer.getId())) {

        throw new IllegalArgumentException(
                "You are not allowed to issue a certificate for this activity."
        );
    }

    if (registration.getStatus()
            != Registration.RegistrationStatus.ATTENDED) {

        redirectAttributes.addFlashAttribute(
                "errorMessage",
                "Certificate can be issued only to attended participants."
        );

        return "redirect:/organizer/activities/"
                + registration.getActivity().getId()
                + "/participants";
    }

    try {
        certificateService.issueCertificate(
                registration.getUser(),
                registration.getActivity()
        );

        redirectAttributes.addFlashAttribute(
                "successMessage",
                "Certificate issued successfully."
        );
    } catch (IllegalArgumentException exception) {

        redirectAttributes.addFlashAttribute(
                "errorMessage",
                exception.getMessage()
        );
    }

    return "redirect:/organizer/activities/"
            + registration.getActivity().getId()
            + "/participants";
}
@GetMapping("/my-certificates")
public String myCertificates(
        Model model,
        Principal principal) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    model.addAttribute(
            "certificates",
            certificateService.getCertificatesByUser(user.getId())
    );

    return "my-certificates";
}
@GetMapping("/certificates/{id}")
public String viewCertificate(
        @PathVariable Long id,
        Model model,
        Principal principal) {

    User user = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Certificate certificate = certificateService.getCertificateById(id);

    if (!certificate.getUser().getId().equals(user.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to view this certificate."
        );
    }

    model.addAttribute("certificate", certificate);

    return "certificate-view";
}
@GetMapping("/certificates/verify")
public String certificateVerificationPage() {
    return "certificate-search";
}
@GetMapping("/certificates/verify/{code}")
public String verifyCertificate(
        @PathVariable String code,
        Model model) {

    try {
        Certificate certificate =
                certificateService.getCertificateByCode(code);

        model.addAttribute("certificate", certificate);

        return "certificate-verify";

    } catch (jakarta.persistence.EntityNotFoundException exception) {

        model.addAttribute("certificateCode", code);

        return "certificate-invalid";
    }
}
@GetMapping("/organizer/activities/{id}/edit")
public String editActivityPage(
        @PathVariable Long id,
        Model model,
        Principal principal) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (!activity.getOrganizer().getId().equals(organizer.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to edit this activity."
        );
    }

    CreateActivityRequest request = new CreateActivityRequest();

    request.setTitle(activity.getTitle());
    request.setDescription(activity.getDescription());
    request.setLocation(activity.getLocation());
    request.setCapacity(activity.getCapacity());
    request.setDateTime(activity.getDateTime());
    request.setRegistrationDeadline(activity.getRegistrationDeadline());
    request.setType(activity.getType().name());
    request.setStatus(activity.getStatus().name());

    model.addAttribute("activity", request);
    model.addAttribute("activityId", id);

    return "edit-activity";
}

@PostMapping("/organizer/activities/{id}/edit")
public String updateActivity(
        @PathVariable Long id,
        @Valid @ModelAttribute("activity") CreateActivityRequest request,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity existingActivity = activityService.getActivityById(id);

    if (!existingActivity.getOrganizer().getId().equals(organizer.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to edit this activity."
        );
    }

    Activity updatedActivity = new Activity();

    updatedActivity.setTitle(request.getTitle());
    updatedActivity.setDescription(request.getDescription());
    updatedActivity.setLocation(request.getLocation());
    updatedActivity.setCapacity(request.getCapacity());
    updatedActivity.setDateTime(request.getDateTime());
    updatedActivity.setRegistrationDeadline(request.getRegistrationDeadline());
    updatedActivity.setType(
            Activity.ActivityType.valueOf(request.getType())
    );
    updatedActivity.setStatus(
            Activity.ActivityStatus.valueOf(request.getStatus())
    );

    activityService.updateActivity(id, updatedActivity);

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Activity updated successfully."
    );

    return "redirect:/organizer/activities";
}
@PostMapping("/organizer/activities/{id}/cancel")
public String cancelActivity(
        @PathVariable Long id,
        Principal principal,
        RedirectAttributes redirectAttributes) {

    User organizer = userRepository.findByUsername(principal.getName())
            .orElseThrow();

    Activity activity = activityService.getActivityById(id);

    if (!activity.getOrganizer().getId().equals(organizer.getId())) {
        throw new IllegalArgumentException(
                "You are not allowed to cancel this activity."
        );
    }

   activityService.cancelActivity(id);

    redirectAttributes.addFlashAttribute(
            "successMessage",
            "Activity cancelled successfully."
    );

    return "redirect:/organizer/activities";
}
}