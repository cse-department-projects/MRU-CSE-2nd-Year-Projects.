package com.athletehub.api.dto;

import com.athletehub.api.entity.Event;

public class EventMapper {

    public static EventResponse toResponse(Event event) {
        if (event == null) {
            return null;
        }

        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setEventCode(event.getEventCode());
        response.setName(event.getName());
        response.setDescription(event.getDescription());
        response.setEventType(event.getEventType());
        if (event.getOrganization() != null) {
            response.setOrganizationId(event.getOrganization().getId());
            response.setOrganizationName(event.getOrganization().getName());
        }
        response.setVenue(event.getVenue());
        response.setCity(event.getCity());
        response.setState(event.getState());
        response.setCountry(event.getCountry());
        response.setRegistrationStartDate(event.getRegistrationStartDate());
        response.setRegistrationEndDate(event.getRegistrationEndDate());
        response.setEventStartDate(event.getEventStartDate());
        response.setEventEndDate(event.getEventEndDate());
        response.setBannerImage(event.getBannerImage());
        response.setStatus(event.getStatus() != null ? event.getStatus().name() : null);
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());

        return response;
    }
}
