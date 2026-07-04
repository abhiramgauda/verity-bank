package com.bank.banking.Services.impl;

import com.bank.banking.dto.AccountDto;
import com.bank.banking.dto.LightUserDto;
import com.bank.banking.dto.Userdto;
import com.bank.banking.models.Role;
import com.bank.banking.models.RoleType;
import com.bank.banking.models.TransactionType;
import com.bank.banking.models.User;
import com.bank.banking.repositories.RoleRepository;
import com.bank.banking.repositories.TransactionRepository;
import com.bank.banking.repositories.UserRepository;
import com.bank.banking.validator.ObjectsValidator;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl {
    private final UserRepository userRepository ;
    private final RoleRepository roleRepository ;
    private final ObjectsValidator<Userdto>validator ;
    private final PasswordEncoder passwordEncoder ;
    private final TransactionRepository transactionRepository ;
    private final AccountServiceImpl accountService  ;



    public Integer create(Userdto userdto) {
        validator.validate(userdto);
        var user = Userdto.toEntity(userdto);
        user.setPassword(passwordEncoder.encode(userdto.getPassword()));
        user.setRoles(List.of(getOrCreateDefaultUserRole()));

        return userRepository.save(user).getId();
    }

    public Integer update(LightUserDto userDto) {
        User user = LightUserDto.toEntity(userDto);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return userRepository.save(user).getId();
    }


    public List<Userdto> findAll() {
        return userRepository.findAll()
                .stream()
                .map(Userdto::FromEntity)
                .collect(Collectors.toList());
    }

    public Userdto findById(Integer id) {
        return userRepository.findById(id)
                .map(Userdto::FromEntity)
                .orElseThrow(() -> new EntityNotFoundException("No user found with the ID:: " + id));
    }



    @Transactional(rollbackOn = Exception.class)
    public Integer validateAccount(Integer userId) {
        var user = userRepository.findById( userId )
                .orElseThrow(() -> new EntityNotFoundException("No user found with the ID for account validation:: " + userId));
        if (user.getAccount() == null) {
            // creates the bank account; the account row itself owns the FK back to
            // this user, so no further linkage is needed on the User side
            var account = AccountDto.builder()
                    .userId(userId)
                    .build();
            accountService.create(account);
        }
        user.setActive(true);
        userRepository.save(user);
        return user.getId();
    }

    public Integer invalidateAccount(Integer userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user found with the ID for account invalidation:: " + userId));
        user.setActive(false);
        userRepository.save(user);
        return user.getId();
    }

    public BigDecimal getAccountBalance(Integer userId) {
        return transactionRepository.findAccountBalance(userId);
    }

    public BigDecimal highestTransfer(Integer userId) {
        return transactionRepository.findHighestAmountByTransactionType(userId, TransactionType.TRANSFERT);
    }
    public BigDecimal highestDeposit(Integer userId) {
        return transactionRepository.findHighestAmountByTransactionType(userId, TransactionType.DEPOSIT);
    }

    public List<Userdto> findAllUsersByState(boolean active) {
        return userRepository.findAllByActive( active )
                .stream()
                .map(Userdto::FromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(rollbackOn = Exception.class)
    public Integer promoteToAdmin(Integer userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user found with the ID for promotion:: " + userId));
        var adminRole = getOrCreateAdminRole();
        var roles = new java.util.ArrayList<>(user.getRoles() == null ? List.of() : user.getRoles());
        boolean alreadyAdmin = roles.stream().anyMatch(r -> r.getName().equals(RoleType.ROLE_ADMIN.name()));
        if (!alreadyAdmin) {
            roles.add(adminRole);
            user.setRoles(roles);
            userRepository.save(user);
        }
        return user.getId();
    }

    @Transactional(rollbackOn = Exception.class)
    public Integer demoteFromAdmin(Integer userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user found with the ID for demotion:: " + userId));
        var roles = new java.util.ArrayList<>(user.getRoles() == null ? List.of() : user.getRoles());
        roles.removeIf(r -> r.getName().equals(RoleType.ROLE_ADMIN.name()));
        user.setRoles(roles);
        userRepository.save(user);
        return user.getId();
    }

    private Role getOrCreateAdminRole() {
        return roleRepository.findByName(RoleType.ROLE_ADMIN.name())
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleType.ROLE_ADMIN.name()).build()
                ));
    }

    private Role getOrCreateDefaultUserRole() {
        return roleRepository.findByName(RoleType.ROLE_USER.name())
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleType.ROLE_USER.name()).build()
                ));
    }
}
