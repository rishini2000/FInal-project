package lk.deenproject.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod {
    CASH("Cash"),
    CARD("Card"),
    BANK_TRANSFER("Bank Transfer");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static PaymentMethod fromDisplayName(String displayName) {
        for (PaymentMethod m : values()) {
            if (m.displayName.equalsIgnoreCase(displayName)) return m;
        }
        throw new IllegalArgumentException("Unknown PaymentMethod: " + displayName);
    }
}
