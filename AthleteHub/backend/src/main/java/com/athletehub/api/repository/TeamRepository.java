package com.athletehub.api.repository;

import com.athletehub.api.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {

    List<Team> findByOrganizationId(Integer organizationId);

    List<Team> findByCoachId(Integer coachId);

    List<Team> findByOrganizationIdAndCoachId(Integer organizationId, Integer coachId);

    Optional<Team> findByTeamCode(String teamCode);

    @Query("SELECT t FROM Team t WHERE t.organization.id = :orgId AND (:coachId IS NULL OR t.coach.id = :coachId) AND (:status IS NULL OR t.status = :status) ORDER BY t.createdAt DESC")
    List<Team> searchTeams(@Param("orgId") Integer orgId, @Param("coachId") Integer coachId, @Param("status") String status);
}
