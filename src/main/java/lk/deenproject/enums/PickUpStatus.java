package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PickUpStatus {
    SCHEDULED("Scheduled"),
    PICKED_UP("Picked Up"),
    PENDING("Pending");

    private final String displayName;

    PickUpStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static PickUpStatus fromDisplayName(String displayName) {
        for (PickUpStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown PickUpStatus: " + displayName);
    }
}
