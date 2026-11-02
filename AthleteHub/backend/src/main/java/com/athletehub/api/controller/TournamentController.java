package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TournamentMapper;
import com.athletehub.api.dto.TournamentRequest;
import com.athletehub.api.dto.TournamentResponse;
import com.athletehub.api.dto.AthleteRegistrationMapper;
import com.athletehub.api.dto.AthleteRegistrationRequest;
import com.athletehub.api.dto.AthleteRegistrationResponse;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.AthleteRegistration;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.service.TournamentService;
import com.athletehub.api.service.AthleteRegistrationService;
import com.athletehub.api.service.BracketGenerationService;
import com.athletehub.api.entity.Match;
import com.athletehub.api.dto.MatchResponse;
import com.athletehub.api.dto.MatchMapper;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.athletehub.api.dto.TournamentTeamRequest;
import com.athletehub.api.dto.TournamentTeamResponse;
import com.athletehub.api.service.TournamentTeamService;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;
    private final AthleteRegistrationService registrationService;
    private final BracketGenerationService bracketGenerationService;
    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final TournamentTeamService tournamentTeamService;

    public TournamentController(TournamentService tournamentService, 
                                AthleteRegistrationService registrationService, 
                                BracketGenerationService bracketGenerationService,
                                UserRepository userRepository,
                                AthleteRepository athleteRepository,
                                TournamentTeamService tournamentTeamService) {
        this.tournamentService = tournamentService;
        this.registrationService = registrationService;
        this.bracketGenerationService = bracketGenerationService;
        this.userRepository = userRepository;
        this.athleteRepository = athleteRepository;
        this.tournamentTeamService = tournamentTeamService;
    }

    private Integer getCurrentUserId() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        if (principal == null) return null;
        User user = userRepository.findByEmailOrUsername(principal).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<TournamentResponse>> createTournament(@RequestBody TournamentRequest request) {
        try {
            Tournament tournament = tournamentService.createTournament(request, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Tournament created successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<TournamentResponse>> updateTournament(@PathVariable Integer id, @RequestBody TournamentRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament existing = tournamentService.getTournamentById(id);
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() == null || !existing.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            Tournament tournament = tournamentService.updateTournament(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Tournament updated successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TournamentResponse>> getTournament(@PathVariable Integer id) {
        try {
            Tournament tournament = tournamentService.getTournamentById(id);
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Tournament details fetched successfully", TournamentMapper.toResponse(tournament)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTournaments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Integer organizationId = null;
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH") || currentUser.getRole().getName().equals("ROLE_ATHLETE")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1;
                }
            }

            Page<Tournament> tournamentPage = tournamentService.searchTournaments(search, eventId, sportId, status, organizationId, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", tournamentPage.getContent().stream().map(TournamentMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", tournamentPage.getTotalElements());
            result.put("total_pages", tournamentPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Tournaments fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AthleteRegistrationResponse>> registerAthlete(@PathVariable Integer id, @RequestBody AthleteRegistrationRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if ("ROLE_ATHLETE".equals(currentUser.getRole().getName())) {
                Athlete athlete = athleteRepository.findByUserId(currentUser.getId());
                if (athlete == null || !athlete.getId().equals(request.getAthleteId())) {
                    throw new Exception("Athletes can register only their own profile.");
                }
            }
            request.setTournamentId(id);
            AthleteRegistration registration = registrationService.registerAthlete(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Athlete registered successfully", AthleteRegistrationMapper.toResponse(registration)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRegistrations(
            @PathVariable Integer id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer athleteId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Integer organizationId = null;
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1;
                }
            }

            Page<AthleteRegistration> registrationPage = registrationService.searchRegistrations(search, id, athleteId, status, organizationId, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", registrationPage.getContent().stream().map(AthleteRegistrationMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", registrationPage.getTotalElements());
            result.put("total_pages", registrationPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Registrations fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
    
    @PutMapping("/registrations/{registrationId}/status")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<AthleteRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Integer registrationId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            AthleteRegistration existing = registrationService.getRegistrationById(registrationId);
            if (("ROLE_ORG_ADMIN".equals(currentUser.getRole().getName()) || "ROLE_COACH".equals(currentUser.getRole().getName())) &&
                    (currentUser.getOrganization() == null ||
                     !currentUser.getOrganization().getId().equals(existing.getTournament().getEvent().getOrganization().getId()))) {
                throw new Exception("Access Denied: Registration belongs to a different organization.");
            }
            AthleteRegistration registration = registrationService.updateRegistrationStatus(registrationId, status, remarks, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Registration status updated successfully", AthleteRegistrationMapper.toResponse(registration)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/registrations/{registrationId}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Integer registrationId) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            AthleteRegistration registration = registrationService.getRegistrationById(registrationId);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !registration.getTournament().getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Registration belongs to a different organization.");
                }
            }

            registrationService.deleteRegistration(registrationId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Registration deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTournament(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament tournament = tournamentService.getTournamentById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            tournamentService.deleteTournament(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Tournament deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/generate-bracket")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('COACH')")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> generateBracket(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Tournament tournament = tournamentService.getTournamentById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !tournament.getEvent().getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Tournament belongs to a different organization.");
                }
            }

            List<Match> matches = bracketGenerationService.generateBracket(id, currentUser.getId());
            List<MatchResponse> response = matches.stream().map(MatchMapper::toResponse).collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Bracket generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/bracket")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getBracket(@PathVariable Integer id) {
        try {
            List<Match> matches = bracketGenerationService.getBracket(id);
            List<MatchResponse> response = matches.stream().map(MatchMapper::toResponse).collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Bracket retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/teams")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TournamentTeamResponse>> addTeamToTournament(
            @PathVariable Integer id,
            @RequestBody TournamentTeamRequest request) {
        try {
            TournamentTeamResponse response = tournamentTeamService.addTeamToTournament(id, request, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Team registered for tournament successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/teams")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TournamentTeamResponse>>> getTournamentTeams(@PathVariable Integer id) {
        try {
            List<TournamentTeamResponse> teams = tournamentTeamService.getTournamentTeams(id);
            return ResponseEntity.ok(ApiResponse.success("Tournament teams fetched successfully", teams));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}/teams/{teamId}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeTeamFromTournament(
            @PathVariable Integer id,
            @PathVariable Integer teamId) {
        try {
            tournamentTeamService.removeTeamFromTournament(id, teamId, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Team removed from tournament successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
}
