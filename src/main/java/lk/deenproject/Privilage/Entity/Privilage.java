package lk.deenproject.Privilage.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.deenproject.User.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "privilage")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Privilage {
@Id//pk
@GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment
private Integer id ;

private Boolean privInsert;
private Boolean privSelect;
private Boolean privUpdate;
private Boolean privDelete;


private LocalDateTime Addeddatetime;
private LocalDateTime Updatedatetime;

@ManyToOne//many to one relationship ekak thiyenawa module class ekata. meka use karala database eke module table ekata foreign key ekak hadanna puluwan.
@JoinColumn(name = "module_id", referencedColumnName = "id")//foreign key column name eka module_id kiyala dila thiyenawa. meka use karala database eke module table ekata foreign key ekak hadanna puluwan.
private Module module_id;

@ManyToOne//many to one relationship ekak thiyenawa role class ekata. meka use karala database eke role table ekata foreign key ekak hadanna puluwan.
@JoinColumn(name = "role_id", referencedColumnName = "id")//foreign key column name eka role_id kiyala dila thiyenawa. meka use karala database eke role table ekata foreign key ekak hadanna puluwan.
private Role role_id;


}
