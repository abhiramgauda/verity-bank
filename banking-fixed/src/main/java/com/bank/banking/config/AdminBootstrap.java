package com.bank.banking.config;

import com.bank.banking.models.Role;
import com.bank.banking.models.RoleType;
import com.bank.banking.models.User;
import com.bank.banking.repositories.RoleRepository;
import com.bank.banking.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * On startup, ensures at least one ROLE_ADMIN user exists.
 * <p>
 * Without this, there is no way to grant the first admin: the admin-only
 * promote/demote endpoints require an existing admin's JWT to call them.
 * If no user with ROLE_ADMIN is found, a default admin account is created
 * using the credentials below (override via application.properties or
 * environment variables). Log in with these credentials once, then either
 * promote your real account and demote/ignore this one, or change its
 * password immediately.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@veritybank.com}")
    private String defaultAdminEmail;

    @Value("${app.admin.password:ChangeMe123!}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getRoles() != null && u.getRoles().stream()
                        .anyMatch(r -> RoleType.ROLE_ADMIN.name().equals(r.getName())));

        if (adminExists) {
            return;
        }

        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.name())
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_ADMIN.name()).build()));

        User admin = userRepository.findByEmail(defaultAdminEmail).orElse(null);

        if (admin == null) {
            admin = User.builder()
                    .firstName("Admin")
                    .lastName("Bootstrap")
                    .email(defaultAdminEmail)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .active(true)
                    .roles(List.of(adminRole))
                    .build();
            userRepository.save(admin);
            log.warn("No admin user found. Created a default admin account ({}). " +
                    "Sign in with this account, then change its password or promote your own account and demote this one.",
                    defaultAdminEmail);
        } else {
            var roles = new java.util.ArrayList<>(admin.getRoles() == null ? List.of() : admin.getRoles());
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            log.warn("No admin user found. Granted ROLE_ADMIN to existing user {}.", defaultAdminEmail);
        }
    }
}
