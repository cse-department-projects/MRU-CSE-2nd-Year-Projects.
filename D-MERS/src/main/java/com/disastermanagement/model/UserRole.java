package com.disastermanagement.model;

public enum UserRole {
    ADMIN("Administrator"),
    CITIZEN("Citizen"),
    RESCUE_TEAM("Rescue Team"),
    VOLUNTEER("Volunteer");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static UserRole fromString(String text) {
        if (text == null) return CITIZEN;
        for (UserRole r : UserRole.values()) {
            if (r.name().equalsIgnoreCase(text) || r.getDisplayName().equalsIgnoreCase(text)) {
                return r;
            }
        }
        return CITIZEN;
    }
}
