package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemCategory {
    WEDDING_DRESSES("Wedding Dresses"),
    ACCESSORIES("Accessories"),
    JEWELRY("Jewelry"),
    SHOES("Shoes");

    private final String displayName;

    ItemCategory(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ItemCategory fromDisplayName(String displayName) {
        for (ItemCategory c : values()) {
            if (c.displayName.equalsIgnoreCase(displayName)) return c;
        }
        throw new IllegalArgumentException("Unknown ItemCategory: " + displayName);
    }
}
