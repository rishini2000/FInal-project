package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ServiceCategory {
    HAIR("Hair"),
    SKIN("Skin"),
    BRIDAL("Bridal"),
    NAILS("Nails");

    private final String displayName;

    ServiceCategory(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ServiceCategory fromDisplayName(String displayName) {
        for (ServiceCategory c : values()) {
            if (c.displayName.equalsIgnoreCase(displayName)) return c;
        }
        throw new IllegalArgumentException("Unknown ServiceCategory: " + displayName);
    }
}
