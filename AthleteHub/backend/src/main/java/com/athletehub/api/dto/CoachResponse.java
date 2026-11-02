package com.athletehub.api.dto;

import java.util.List;

public class CoachResponse {
    private List<CoachDTO> coaches;
    private long totalRecords;
    private int totalPages;
    private int page;
    private int pageSize;

    public CoachResponse() {}

    public CoachResponse(List<CoachDTO> coaches, long totalRecords, int totalPages, int page, int pageSize) {
        this.coaches = coaches;
        this.totalRecords = totalRecords;
        this.totalPages = totalPages;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<CoachDTO> getCoaches() { return coaches; }
    public void setCoaches(List<CoachDTO> coaches) { this.coaches = coaches; }

    public long getTotalRecords() { return totalRecords; }
    public void setTotalRecords(long totalRecords) { this.totalRecords = totalRecords; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }
}
