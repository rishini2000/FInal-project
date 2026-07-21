package lk.deenproject.leaveplan.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_day")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate leave_date;
    private String leave_type;
    private LocalTime start_time;
    private LocalTime end_time;

    @ManyToOne
    @JoinColumn(name = "leave_plan_id", referencedColumnName = "id")
    private LeavePlan leave_plan_id;
}
