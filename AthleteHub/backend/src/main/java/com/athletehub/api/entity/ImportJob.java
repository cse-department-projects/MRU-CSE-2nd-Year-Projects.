package com.athletehub.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "import_jobs")
public class ImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "dataset_name", length = 100)
    private String datasetName;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "total_rows")
    private Integer totalRows = 0;

    @Column(name = "imported_rows")
    private Integer importedRows = 0;

    @Column(name = "skipped_rows")
    private Integer skippedRows = 0;

    @Column(name = "duplicate_rows")
    private Integer duplicateRows = 0;

    @Column(name = "failed_rows")
    private Integer failedRows = 0;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs = 0L;

    @Column(name = "created_by")
    private Integer createdBy;

    public ImportJob() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getDatasetName() { return datasetName; }
    public void setDatasetName(String datasetName) { this.datasetName = datasetName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }

    public Integer getImportedRows() { return importedRows; }
    public void setImportedRows(Integer importedRows) { this.importedRows = importedRows; }

    public Integer getSkippedRows() { return skippedRows; }
    public void setSkippedRows(Integer skippedRows) { this.skippedRows = skippedRows; }

    public Integer getDuplicateRows() { return duplicateRows; }
    public void setDuplicateRows(Integer duplicateRows) { this.duplicateRows = duplicateRows; }

    public Integer getFailedRows() { return failedRows; }
    public void setFailedRows(Integer failedRows) { this.failedRows = failedRows; }

    public Long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
}
