package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EmployeeStatus {

    ACTIVE("Active"),
    RESIGNED("Resigned"),
    INACTIVE("Inactive"),
    DELETED("Deleted");


    private final String displayName;

    EmployeeStatus(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static EmployeeStatus fromDisplayName(String displayName) {
        for (EmployeeStatus e : values()) {
            if (e.displayName.equalsIgnoreCase(displayName)) return e;
        }
        throw new IllegalArgumentException("Unknown EmployeeStatus: " + displayName);
    }
}
