package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemSize {
    XS("XS"),
    S("S"),
    M("M"),
    L("L"),
    XL("XL");

    private final String displayName;

    ItemSize(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static ItemSize fromDisplayName(String displayName) {
        for (ItemSize s : values()) {
            if (s.displayName.equalsIgnoreCase(displayName)) return s;
        }
        throw new IllegalArgumentException("Unknown ItemSize: " + displayName);
    }
}
