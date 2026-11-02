package com.athletehub.api.repository;

import com.athletehub.api.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Integer> {

    List<TeamMember> findByTeamId(Integer teamId);

    List<TeamMember> findByTeamIdAndStatus(Integer teamId, String status);

    List<TeamMember> findByAthleteId(Integer athleteId);

    Optional<TeamMember> findByTeamIdAndAthleteId(Integer teamId, Integer athleteId);

    Optional<TeamMember> findByTeamIdAndAthleteIdAndStatus(Integer teamId, Integer athleteId, String status);

    boolean existsByTeamIdAndAthleteId(Integer teamId, Integer athleteId);

    boolean existsByTeamIdAndAthleteIdAndStatus(Integer teamId, Integer athleteId, String status);

    void deleteByTeamIdAndAthleteId(Integer teamId, Integer athleteId);

    long countByTeamId(Integer teamId);

    long countByTeamIdAndStatus(Integer teamId, String status);

    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.team t WHERE tm.athlete.id = :athleteId AND (tm.status IS NULL OR tm.status = 'ACTIVE') AND t.status != 'REJECTED'")
    List<TeamMember> findActiveMembershipsByAthleteId(@Param("athleteId") Integer athleteId);

    @Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.team t WHERE (tm.status IS NULL OR tm.status = 'ACTIVE') AND t.status != 'REJECTED'")
    List<TeamMember> findAllActiveMemberships();
}
