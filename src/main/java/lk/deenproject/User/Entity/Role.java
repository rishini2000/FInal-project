package lk.deenproject.User.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Table(name = "role")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Role {
@Id//pk
@GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment
private Integer id ; 

private String name ;




}


