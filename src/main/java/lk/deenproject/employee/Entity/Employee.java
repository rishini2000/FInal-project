package lk.deenproject.employee.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lk.deenproject.enums.Designation;
import lk.deenproject.enums.EmployeeStatus;
import lk.deenproject.leaveplan.entity.LeavePlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employee")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String empno;
    @NotBlank @Size(min = 2, max = 100)
    private String fullname;
    @NotBlank @Size(max = 50)
    private String callingname;
    @NotBlank @Size(max = 12)
    private String nic;
    @NotBlank @Pattern(regexp = "^\\d{9,10}$")
    private String mobile;

    @NotNull
    private LocalDate dob;

    private String address;
    @NotBlank @Email
    private String email;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "designation")
    private Designation designation;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "employee_status")
    private EmployeeStatus employeeStatus;

    @JsonIgnore
    @OneToMany(mappedBy = "employee_id")
    private List<EmployeePermLeave> employeePermLeaveList;

    @JsonIgnore
    @OneToMany(mappedBy = "employee_id")
    private List<LeavePlan> leavePlanList;

    public Employee(Integer id, String fullname, String nic, String email, String mobileno,
            Designation designation, EmployeeStatus employeeStatus, LocalDate dob) {
        this.id = id;
        this.fullname = fullname;
        this.nic = nic;
        this.email = email;
        this.mobile = mobileno;
        this.designation = designation;
        this.employeeStatus = employeeStatus;
        this.dob = dob;
    }
}
