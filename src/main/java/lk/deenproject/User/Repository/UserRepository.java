package lk.deenproject.User.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.User.Entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = "SELECT u FROM User u WHERE u.username=?1")
    User getByUsername(String username);

    @Query(value = "SELECT u FROM User u WHERE u.employee_id.id=?1")
    User getByEmployee_Id(Integer emp_id);

    @Query(value = "Select new User(u.id, u.username, u.status, u.employee_id) from User u where u.username <> 'Admin' AND u.status = true")
    List<User> getSelectedColumn();

}
