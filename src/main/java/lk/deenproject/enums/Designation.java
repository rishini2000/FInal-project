package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Designation {
    HAIR_STYLIST("Hair Stylist"),
    MAKEUP_ARTIST("Makeup Artist"),
    BRIDAL_CONSULTANT("Bridal Consultant"),
    NAIL_TECHNICIAN("Nail Technician"),
    RECEPTIONIST("Receptionist");

    private final String displayName;

    Designation(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static Designation fromDisplayName(String displayName) {
        for (Designation d : values()) {
            if (d.displayName.equalsIgnoreCase(displayName)) return d;
        }
        throw new IllegalArgumentException("Unknown Designation: " + displayName);
    }
}
