package lk.deenproject.User.Entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.deenproject.employee.Entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user")

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id ; 

@NotBlank @Size(min=3, max=50)
private String username ;
@NotBlank @Size(min=6)
private String password ;
@NotNull
private Boolean status ;
private String note ;

private java.time.LocalDateTime addeddatetime ;
private java.time.LocalDateTime updateddatetime ;
private java.time.LocalDateTime deletedatetime ;

@ManyToOne // many users to one role
@JoinColumn (name = "employee_id", referencedColumnName = "id")// this annotation is used to specify the foreign key column in the user table that references the primary key column in the employee table
private Employee employee_id ;

@ManyToMany(fetch = FetchType.EAGER)
@JoinTable(
    name = "user_has_role",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id")
)
@NotEmpty
private List<Role> roles;


public User(Integer id, String username, Boolean status, Employee employee_id) {
    this.id = id;
    this.username = username;
    this.status = status;
    this.employee_id = employee_id;
}
}
