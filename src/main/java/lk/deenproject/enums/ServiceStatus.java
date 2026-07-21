package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ServiceStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private final String displayName;

    ServiceStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ServiceStatus fromDisplayName(String displayName) {
        for (ServiceStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown ServiceStatus: " + displayName);
    }
}
