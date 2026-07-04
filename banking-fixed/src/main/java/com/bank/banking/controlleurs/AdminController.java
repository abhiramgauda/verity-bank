package com.bank.banking.controlleurs;


import com.bank.banking.Services.impl.UserServiceImpl;
import com.bank.banking.dto.Userdto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminController {

     @NonNull
    private final UserServiceImpl service;

    @GetMapping("/users/inactive")
    public ResponseEntity<List<Userdto>> findAllNonActiveUsers() {
        return ResponseEntity.ok(service.findAllUsersByState(false));
    }

    @GetMapping("/users/active")
    public ResponseEntity<List<Userdto>> findAllActiveUsers() {
        return ResponseEntity.ok(service.findAllUsersByState(true));
    }

    @PatchMapping("/users/{user-id}/promote")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Integer promote(
            @PathVariable("user-id") Integer id
    ) {
        return service.promoteToAdmin(id);
    }

    @PatchMapping("/users/{user-id}/demote")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Integer demote(
            @PathVariable("user-id") Integer id
    ) {
        return service.demoteFromAdmin(id);
    }
}