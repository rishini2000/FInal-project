package lk.deenproject.User.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.User.Entity.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    @Query(value = "SELECT r FROM Role r WHERE r.name <> 'Admin'")
    List<Role> getAllDatawithoutAdmin();

    @Query(value = "SELECT r FROM Role r WHERE r.id IN (SELECT uhr.role.id FROM UserHasRole uhr WHERE uhr.user.id=?1)")
    List<Role> getRolesByUserId(Integer userId);
}
