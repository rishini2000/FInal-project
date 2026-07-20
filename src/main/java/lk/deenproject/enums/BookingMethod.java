package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingMethod {
    PHONE("Phone"),
    WALK_IN("Walk-in");
    // ONLINE("Online");

    private final String displayName;

    BookingMethod(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static BookingMethod fromDisplayName(String displayName) {
        for (BookingMethod m : values()) {
            if (m.displayName.equalsIgnoreCase(displayName)) return m;
        }
        throw new IllegalArgumentException("Unknown BookingMethod: " + displayName);
    }
}
