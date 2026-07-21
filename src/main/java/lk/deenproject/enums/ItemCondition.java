package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemCondition {
    GOOD("Good"),
    DAMAGED("Damaged"),
    LOST("Lost");

    private final String displayName;

    ItemCondition(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ItemCondition fromDisplayName(String displayName) {
        for (ItemCondition c : values()) {
            if (c.displayName.equalsIgnoreCase(displayName)) return c;
        }
        throw new IllegalArgumentException("Unknown ItemCondition: " + displayName);
    }
}
