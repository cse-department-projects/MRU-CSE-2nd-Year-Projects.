package com.example.Rural.management.controller;

import com.example.Rural.management.model.ShgGroup;
import com.example.Rural.management.service.ShgService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shg")
@CrossOrigin(origins = "*")
public class ShgController {

    private final ShgService shgService;

    public ShgController(ShgService shgService) {
        this.shgService = shgService;
    }

    @GetMapping
    public List<ShgGroup> getAllGroups() {
        return shgService.getAllGroups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShgGroup> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(shgService.getGroupById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ShgGroup> getGroupByCode(@PathVariable String code) {
        return ResponseEntity.ok(shgService.getGroupByCode(code));
    }

    @PostMapping
    public ResponseEntity<ShgGroup> createGroup(@Valid @RequestBody ShgGroup group) {
        ShgGroup created = shgService.createGroup(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShgGroup> updateGroup(@PathVariable Long id,
                                                 @Valid @RequestBody ShgGroup group) {
        return ResponseEntity.ok(shgService.updateGroup(id, group));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        shgService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
