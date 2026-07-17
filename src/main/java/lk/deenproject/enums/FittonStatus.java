package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FittonStatus {
    SCHEDULED("Scheduled"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    FittonStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static FittonStatus fromDisplayName(String displayName) {
        for (FittonStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown FittonStatus: " + displayName);
    }
}
