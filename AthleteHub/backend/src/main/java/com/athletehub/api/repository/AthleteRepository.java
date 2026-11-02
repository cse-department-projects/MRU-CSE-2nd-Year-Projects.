package com.athletehub.api.repository;

import com.athletehub.api.entity.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.time.LocalDate;

public interface AthleteRepository extends JpaRepository<Athlete, Integer>, JpaSpecificationExecutor<Athlete> {
    Athlete findByUserId(Integer userId);
    List<Athlete> findByOrganizationIdAndStatusNot(Integer organizationId, String status);
    
    @Query(value = "SELECT id FROM athletes ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastInsertedId();
    
    @Query("SELECT a.organizationId as orgId, COUNT(a) as count FROM Athlete a WHERE a.organizationId IN :orgIds AND a.status != 'Deleted' GROUP BY a.organizationId")
    List<Object[]> countActiveAthletesByOrganizationIds(@org.springframework.data.repository.query.Param("orgIds") java.util.List<Integer> orgIds);
    
    @Query("SELECT COUNT(a) FROM Athlete a WHERE a.organizationId = :orgId AND a.status != 'Deleted'")
    long countActiveAthletesByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Integer orgId);

    long countByStatusNot(String status);
    long countByStatusNotAndOrganizationIdIsNull(String status);

    /**
     * Import identity check.  An imported record has no application user, so a
     * stable biographical key is used instead of user_id.
     */
    boolean existsByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndDateOfBirthAndCountryIgnoreCase(
            String firstName, String lastName, LocalDate dateOfBirth, String country);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("UPDATE Athlete a SET a.organizationId = :targetOrgId WHERE a.id IN :athleteIds")
    int assignAthletesToOrganization(@org.springframework.data.repository.query.Param("athleteIds") List<Integer> athleteIds, @org.springframework.data.repository.query.Param("targetOrgId") Integer targetOrgId);

    @Query(value = "SELECT id FROM athletes WHERE organization_id IS NULL AND status != 'Deleted' LIMIT :limit", nativeQuery = true)
    List<Integer> findUnassignedAthleteIds(@org.springframework.data.repository.query.Param("limit") int limit);

    @Query("SELECT s.id, s.name, COUNT(a) FROM Athlete a JOIN a.sport s WHERE a.organizationId IS NULL AND a.status != 'Deleted' GROUP BY s.id, s.name ORDER BY COUNT(a) DESC")
    List<Object[]> findUnassignedSportsWithCounts();

    @Query("SELECT a.country, COUNT(a) FROM Athlete a WHERE a.organizationId IS NULL AND a.country IS NOT NULL AND a.country != '' AND a.status != 'Deleted' GROUP BY a.country ORDER BY COUNT(a) DESC")
    List<Object[]> findUnassignedCountriesWithCounts();

    @Query("SELECT a.gender, COUNT(a) FROM Athlete a WHERE a.organizationId IS NULL AND a.gender IS NOT NULL AND a.status != 'Deleted' GROUP BY a.gender ORDER BY COUNT(a) DESC")
    List<Object[]> findUnassignedGendersWithCounts();

    @Query(value = "SELECT id FROM athletes WHERE organization_id IS NULL AND status != 'Deleted' " +
           "AND (:sportId IS NULL OR sport_id = :sportId) " +
           "AND (:country IS NULL OR country = :country) " +
           "AND (:gender IS NULL OR gender = :gender) " +
           "LIMIT :limit", nativeQuery = true)
    List<Integer> findUnassignedAthleteIdsByCriteria(
            @org.springframework.data.repository.query.Param("sportId") Integer sportId,
            @org.springframework.data.repository.query.Param("country") String country,
            @org.springframework.data.repository.query.Param("gender") String gender,
            @org.springframework.data.repository.query.Param("limit") int limit);

    @Query(value = "SELECT COUNT(*) FROM athletes WHERE organization_id IS NULL AND status != 'Deleted' " +
           "AND (:sportId IS NULL OR sport_id = :sportId) " +
           "AND (:country IS NULL OR country = :country) " +
           "AND (:gender IS NULL OR gender = :gender)", nativeQuery = true)
    long countUnassignedAthletesByCriteria(
            @org.springframework.data.repository.query.Param("sportId") Integer sportId,
            @org.springframework.data.repository.query.Param("country") String country,
            @org.springframework.data.repository.query.Param("gender") String gender);
}
