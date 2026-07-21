package lk.deenproject.Privilage.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.deenproject.Privilage.Entity.Privilage;

public interface PrivilageRepository extends JpaRepository<Privilage, Integer> {

    @Query(value = "SELECT p FROM Privilage p WHERE p.role_id.id=?1 AND p.module_id.id=?2")
    Privilage getByRoleModule(Integer roleId, Integer moduleId);

    @Query("SELECT p FROM Privilage p WHERE p.role_id.id IN :roleIds")
    List<Privilage> getByRoleIds(@Param("roleIds") List<Integer> roleIds);
}
