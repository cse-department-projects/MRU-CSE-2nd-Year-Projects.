package com.athletehub.api.dto;

import java.util.List;

public class CoachAssignmentResponse {
    private List<CoachAssignmentDTO> assignments;
    private long totalRecords;
    private int totalPages;
    private int page;
    private int pageSize;

    public CoachAssignmentResponse() {}

    public CoachAssignmentResponse(List<CoachAssignmentDTO> assignments, long totalRecords, int totalPages, int page, int pageSize) {
        this.assignments = assignments;
        this.totalRecords = totalRecords;
        this.totalPages = totalPages;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<CoachAssignmentDTO> getAssignments() { return assignments; }
    public void setAssignments(List<CoachAssignmentDTO> assignments) { this.assignments = assignments; }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
