package com.bank.banking;

import com.bank.banking.models.Role;
import com.bank.banking.models.RoleType;
import com.bank.banking.models.User;
import com.bank.banking.repositories.RoleRepository;
import com.bank.banking.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class BankingApplication {

	public static void main(String[] args) {
		SpringApplication.run(BankingApplication.class, args);
	}

	/**
	 * Seeds a default admin account on first startup.
	 *
	 * Without this, there was no path in the application that could ever grant
	 * ROLE_ADMIN to a user (registration always assigns ROLE_USER), which meant
	 * /api/v1/admin/** and the validate/invalidate endpoints were unreachable.
	 *
	 * IMPORTANT: this is a development convenience. Log in as admin@bank.com and
	 * change the password (or remove this seeding logic) before using this
	 * anywhere beyond local testing.
	 */
	@Bean
	public CommandLineRunner seedAdminUser(
			UserRepository userRepository,
			RoleRepository roleRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			if (userRepository.findByEmail("admin@bank.com").isPresent()) {
				return;
			}

			var adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN.name())
					.orElseGet(() -> roleRepository.save(
							Role.builder().name(RoleType.ROLE_ADMIN.name()).build()
					));

			var admin = User.builder()
					.firstName("Admin")
					.lastName("Admin")
					.email("admin@bank.com")
					.password(passwordEncoder.encode("changeit123"))
					.active(true)
					.roles(List.of(adminRole))
					.build();

			userRepository.save(admin);
		};
	}
}
