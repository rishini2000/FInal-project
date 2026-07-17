package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum RentalStatus {
    ACTIVE("Active"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    RentalStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static RentalStatus fromDisplayName(String displayName) {
        for (RentalStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown RentalStatus: " + displayName);
    }
}
