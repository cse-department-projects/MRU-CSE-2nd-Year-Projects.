package com.athletehub.api.repository;

import com.athletehub.api.entity.RankingHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RankingHistoryRepository extends JpaRepository<RankingHistory, Integer> {

    Page<RankingHistory> findByAthleteIdAndIsDeletedFalse(Integer athleteId, Pageable pageable);

    @Query("SELECT r FROM RankingHistory r WHERE r.category = :category AND r.isDeleted = false ORDER BY r.dateRecorded DESC, r.rankPosition ASC")
    List<RankingHistory> findLatestByCategory(@Param("category") String category);
}
