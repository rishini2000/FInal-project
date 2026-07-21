package lk.deenproject.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lk.deenproject.Privilage.Entity.Privilage;
import lk.deenproject.Privilage.Repository.PrivilageRepository;
import lk.deenproject.User.Entity.Role;
import lk.deenproject.User.Repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrivilageRepository privilageRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        lk.deenproject.User.Entity.User appUser = userRepository.getByUsername(username);

        if (appUser == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        if (!appUser.getStatus()) {
            throw new UsernameNotFoundException("User account is disabled: " + username);
        }

        List<GrantedAuthority> authorities = buildAuthorities(appUser);

        return new User(
            appUser.getUsername(),
            appUser.getPassword(),
            appUser.getStatus(),
            true,   // accountNonExpired
            true,   // credentialsNonExpired
            true,   // accountNonLocked
            authorities
        );
    }

    private List<GrantedAuthority> buildAuthorities(lk.deenproject.User.Entity.User appUser) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        List<Role> roles = appUser.getRoles();
        if (roles == null || roles.isEmpty()) {
            return authorities;
        }

        // Add role authorities (e.g., "ADMIN", "MANAGER", "STYLIST", "RENTAL_MANAGER")
        for (Role role : roles) {
            authorities.add(new SimpleGrantedAuthority(role.getName().toUpperCase().replace(" ", "_")));
        }

        List<Integer> roleIds = roles.stream()
            .map(Role::getId)
            .toList();

        List<Privilage> privileges = privilageRepository.getByRoleIds(roleIds);

        for (Privilage priv : privileges) {
            String moduleName = priv.getModule_id().getName().toUpperCase().replace(" ", "_");

            if (Boolean.TRUE.equals(priv.getPrivSelect())) {
                authorities.add(new SimpleGrantedAuthority(moduleName + "_SELECT"));
            }
            if (Boolean.TRUE.equals(priv.getPrivInsert())) {
                authorities.add(new SimpleGrantedAuthority(moduleName + "_INSERT"));
            }
            if (Boolean.TRUE.equals(priv.getPrivUpdate())) {
                authorities.add(new SimpleGrantedAuthority(moduleName + "_UPDATE"));
            }
            if (Boolean.TRUE.equals(priv.getPrivDelete())) {
                authorities.add(new SimpleGrantedAuthority(moduleName + "_DELETE"));
            }
        }

        return authorities;
    }
}
