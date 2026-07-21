package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemStatus {
    AVAILABLE("Available"),
    RENTED("Rented"),
    UNDER_MAINTENANCE("Under Maintenance");

    private final String displayName;

    ItemStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ItemStatus fromDisplayName(String displayName) {
        for (ItemStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown ItemStatus: " + displayName);
    }
}
