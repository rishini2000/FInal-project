package lk.deenproject.common;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import lk.deenproject.enums.AppointmentStatus;
import lk.deenproject.enums.BookingMethod;
import lk.deenproject.enums.Designation;
import lk.deenproject.enums.EmployeeStatus;
import lk.deenproject.enums.FittonStatus;
import lk.deenproject.enums.HandOverStatus;
import lk.deenproject.enums.ItemCategory;
import lk.deenproject.enums.ItemCondition;
import lk.deenproject.enums.ItemSize;
import lk.deenproject.enums.ItemStatus;
import lk.deenproject.enums.PaymentMethod;
import lk.deenproject.enums.PickUpStatus;
import lk.deenproject.enums.RentalStatus;
import lk.deenproject.enums.ServiceCategory;
import lk.deenproject.enums.ServicePackageStatus;
import lk.deenproject.enums.ServiceStatus;

@RestController
public class EnumController {

    @GetMapping("/api/enums/{enumName}")
    public List<Map<String, String>> getEnumValues(@PathVariable String enumName) {
        Enum<?>[] values = switch (enumName) {
            case "designation" -> Designation.values();
            case "employeeStatus" -> EmployeeStatus.values();
            case "itemCategory" -> ItemCategory.values();
            case "itemSize" -> ItemSize.values();
            case "itemStatus" -> ItemStatus.values();
            case "serviceCategory" -> ServiceCategory.values();
            case "serviceStatus" -> ServiceStatus.values();
            case "appointmentStatus" -> AppointmentStatus.values();
            case "bookingMethod" -> BookingMethod.values();
            case "paymentMethod" -> PaymentMethod.values();
            case "rentalStatus" -> RentalStatus.values();
            case "pickUpStatus" -> PickUpStatus.values();
            case "fittonStatus" -> FittonStatus.values();
            case "handoverStatus" -> HandOverStatus.values();
            case "itemCondition" -> ItemCondition.values();
            case "servicePackageStatus" -> ServicePackageStatus.values();
            default -> throw new IllegalArgumentException("Unknown enum: " + enumName);
        };

        return Arrays.stream(values).map(e -> {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("name", e.name());
            map.put("displayName", getDisplayName(e));
            return map;
        }).toList();
    }

    private String getDisplayName(Enum<?> e) {
        try {
            Method m = e.getClass().getMethod("getDisplayName");
            return (String) m.invoke(e);
        } catch (Exception ex) {
            return e.name();
        }
    }
}
