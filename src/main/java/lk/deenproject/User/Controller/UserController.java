package lk.deenproject.User.Controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.common.BaseController;
import lk.deenproject.User.Entity.User;
import lk.deenproject.User.Repository.UserRepository;

@RestController
public class UserController extends BaseController<User, Integer> {

    @Autowired
    private UserRepository userDao;

    @Override
    protected UserRepository getRepository() {
        return userDao;
    }

    @Override
    protected String getEntityName() {
        return "user";
    }

    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public org.springframework.web.servlet.ModelAndView getUserUI() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('USER_SELECT')")
    @GetMapping(value = "/user/byid/{id}", produces = "application/json")
    public User getRoleByUserId(@PathVariable(name = "id") Integer userid) {
        return userDao.getReferenceById(userid);
    }

    @PreAuthorize("hasAuthority('USER_SELECT')")
    @GetMapping(value = "/user/alldata", produces = "application/json")
    public List<User> getAllData() {
        return userDao.getSelectedColumn();
    }

    @PreAuthorize("hasAuthority('USER_INSERT')")
    @PostMapping(value = "/user/insert")
    public String saveData(@Valid @RequestBody User user) {
        User extistingUserByEmployee = userDao.getByEmployee_Id(user.getEmployee_id().getId());
        if (extistingUserByEmployee != null) {
            return error("save", "Employee already assigned to another user in database.");
        }

        try {
            user.setAddeddatetime(LocalDateTime.now());
            userDao.save(user);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @PutMapping(value = "/user/update")
    public String updateData(@Valid @RequestBody User user) {
        User existingUser = userDao.getReferenceById(user.getId());
        if (existingUser == null) {
            return error("update", user.getUsername() + " not available in database.");
        }

        User extistingUserByEmployee = userDao.getByEmployee_Id(user.getEmployee_id().getId());
        if (extistingUserByEmployee != null && extistingUserByEmployee.getId() != user.getId()) {
            return error("update", "Employee already assigned to another user in database.");
        }

        try {

            user.setAddeddatetime(existingUser.getAddeddatetime());
            user.setDeletedatetime(existingUser.getDeletedatetime());
            user.setUpdateddatetime(LocalDateTime.now());

            userDao.save(user);
            return success();

        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('USER_DELETE')")
    @DeleteMapping(value = "/user/delete")
    public String deleteData(@RequestBody User user) {
        User existingUser = userDao.getReferenceById(user.getId());
        if (existingUser == null) {
            return error("delete", user.getUsername() + " not available in database.");
        }

        try {

            existingUser.setStatus(false);
            existingUser.setDeletedatetime(LocalDateTime.now());

            userDao.save(existingUser);

            return success();

        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
