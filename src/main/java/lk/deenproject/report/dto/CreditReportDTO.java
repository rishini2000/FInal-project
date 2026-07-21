package lk.deenproject.report.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreditReportDTO {
    private Integer customerId;
    private String customerName;
    private String customerMobile;
    private BigDecimal totalCredit;
    private LocalDateTime lastPaymentDate;
    private Long appointmentCount;
}
