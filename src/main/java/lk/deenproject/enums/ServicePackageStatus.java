package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ServicePackageStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");

    private final String displayName;

    ServicePackageStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ServicePackageStatus fromDisplayName(String displayName) {
        for (ServicePackageStatus s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown ServicePackageStatus: " + displayName);
    }
}
