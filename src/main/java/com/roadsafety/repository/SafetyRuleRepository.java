package com.roadsafety.repository;

import com.roadsafety.model.SafetyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SafetyRuleRepository extends JpaRepository<SafetyRule, Long> {
    List<SafetyRule> findByCategory(String category);
}
