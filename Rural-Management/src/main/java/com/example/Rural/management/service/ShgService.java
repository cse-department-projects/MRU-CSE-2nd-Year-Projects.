package com.example.Rural.management.service;

import com.example.Rural.management.exception.ResourceNotFoundException;
import com.example.Rural.management.model.ShgGroup;
import com.example.Rural.management.repository.ShgRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ShgService {

    private final ShgRepository shgRepository;

    public ShgService(ShgRepository shgRepository) {
        this.shgRepository = shgRepository;
    }

    @Transactional(readOnly = true)
    public List<ShgGroup> getAllGroups() {
        return shgRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ShgGroup getGroupById(Long id) {
        return shgRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SHG Group", "id", id));
    }

    @Transactional(readOnly = true)
    public ShgGroup getGroupByCode(String code) {
        return shgRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ResourceNotFoundException("SHG Group", "code", code));
    }

    @Transactional(readOnly = true)
    public long getGroupCount() {
        return shgRepository.count();
    }

    public ShgGroup createGroup(ShgGroup group) {
        return shgRepository.save(group);
    }

    public ShgGroup updateGroup(Long id, ShgGroup groupDetails) {
        ShgGroup group = getGroupById(id);
        group.setCode(groupDetails.getCode());
        group.setName(groupDetails.getName());
        group.setWard(groupDetails.getWard());
        group.setMemberCount(groupDetails.getMemberCount());
        group.setStatus(groupDetails.getStatus());
        group.setActivities(groupDetails.getActivities());
        group.setSavingsPool(groupDetails.getSavingsPool());
        group.setLeaderName(groupDetails.getLeaderName());
        group.setTreasurerName(groupDetails.getTreasurerName());
        group.setBankName(groupDetails.getBankName());
        group.setAccountMasked(groupDetails.getAccountMasked());
        group.setMeetingSchedule(groupDetails.getMeetingSchedule());
        group.setFormedDate(groupDetails.getFormedDate());
        group.setLoanStatus(groupDetails.getLoanStatus());
        group.setDescription(groupDetails.getDescription());
        group.setMemberList(groupDetails.getMemberList());
        return shgRepository.save(group);
    }

    public void deleteGroup(Long id) {
        ShgGroup group = getGroupById(id);
        shgRepository.delete(group);
    }
}
