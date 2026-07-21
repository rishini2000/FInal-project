package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum AppointmentStatus {
    CONFIRMED("Confirmed"),
    PENDING("Pending"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    AppointmentStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static AppointmentStatus fromDisplayName(String displayName) {
        for (AppointmentStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown AppointmentStatus: " + displayName);
    }
}
