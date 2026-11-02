package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentNoteRepository extends JpaRepository<RecruitmentNote, Integer> {
    List<RecruitmentNote> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
}
