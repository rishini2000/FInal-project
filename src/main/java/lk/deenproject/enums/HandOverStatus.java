package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum HandOverStatus {
    RETURNED("Returned"),
    PARTIAL_RETURN("Partial Return"),
    PENDING("Pending");

    private final String displayName;

    HandOverStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static HandOverStatus fromDisplayName(String displayName) {
        for (HandOverStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown HandOverStatus: " + displayName);
    }
}
