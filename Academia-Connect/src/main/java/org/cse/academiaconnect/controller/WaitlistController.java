package org.cse.academiaconnect.controller;

import jakarta.validation.Valid;
import org.cse.academiaconnect.entity.Waitlist;
import org.cse.academiaconnect.service.WaitlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlists")
@CrossOrigin(origins = "*")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping
    public ResponseEntity<Waitlist> createWaitlist(@Valid @RequestBody Waitlist waitlist) {
        return new ResponseEntity<>(waitlistService.createWaitlist(waitlist), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Waitlist>> getAllWaitlistEntries() {
        return ResponseEntity.ok(waitlistService.getAllWaitlistEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Waitlist> getWaitlistById(@PathVariable Long id) {
        return ResponseEntity.ok(waitlistService.getWaitlistById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Waitlist> updateWaitlist(@PathVariable Long id,
                                                   @Valid @RequestBody Waitlist waitlist) {
        return ResponseEntity.ok(waitlistService.updateWaitlist(id, waitlist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWaitlist(@PathVariable Long id) {
        waitlistService.deleteWaitlist(id);
        return ResponseEntity.ok("Waitlist entry deleted successfully.");
    }
}