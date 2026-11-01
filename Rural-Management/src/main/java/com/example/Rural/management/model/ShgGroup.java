package com.example.Rural.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "shg_groups")
public class ShgGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Group code is required")
    @Column(nullable = false, unique = true)
    private String code;

    @NotBlank(message = "Group name is required")
    @Column(nullable = false)
    private String name;

    private String ward;
    private Integer memberCount;
    private String status;
    private String activities;
    private String savingsPool;
    private String leaderName;
    private String treasurerName;
    private String bankName;
    private String accountMasked;
    private String meetingSchedule;
    private String formedDate;
    private String loanStatus;

    @Column(length = 1500)
    private String description;

    @Column(length = 2000)
    private String memberList;

    public ShgGroup() {}

    public ShgGroup(String code, String name, String ward, Integer memberCount, String status,
                    String activities, String savingsPool, String leaderName, String treasurerName,
                    String bankName, String accountMasked, String meetingSchedule, String formedDate,
                    String loanStatus, String description, String memberList) {
        this.code = code;
        this.name = name;
        this.ward = ward;
        this.memberCount = memberCount;
        this.status = status;
        this.activities = activities;
        this.savingsPool = savingsPool;
        this.leaderName = leaderName;
        this.treasurerName = treasurerName;
        this.bankName = bankName;
        this.accountMasked = accountMasked;
        this.meetingSchedule = meetingSchedule;
        this.formedDate = formedDate;
        this.loanStatus = loanStatus;
        this.description = description;
        this.memberList = memberList;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getActivities() { return activities; }
    public void setActivities(String activities) { this.activities = activities; }

    public String getSavingsPool() { return savingsPool; }
    public void setSavingsPool(String savingsPool) { this.savingsPool = savingsPool; }

    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }

    public String getTreasurerName() { return treasurerName; }
    public void setTreasurerName(String treasurerName) { this.treasurerName = treasurerName; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountMasked() { return accountMasked; }
    public void setAccountMasked(String accountMasked) { this.accountMasked = accountMasked; }

    public String getMeetingSchedule() { return meetingSchedule; }
    public void setMeetingSchedule(String meetingSchedule) { this.meetingSchedule = meetingSchedule; }

    public String getFormedDate() { return formedDate; }
    public void setFormedDate(String formedDate) { this.formedDate = formedDate; }

    public String getLoanStatus() { return loanStatus; }
    public void setLoanStatus(String loanStatus) { this.loanStatus = loanStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMemberList() { return memberList; }
    public void setMemberList(String memberList) { this.memberList = memberList; }
}
