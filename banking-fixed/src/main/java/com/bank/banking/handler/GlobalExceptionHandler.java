package com.bank.banking.handler;


import com.bank.banking.exceptions.ObjectValidationException;
import com.bank.banking.exceptions.OperationNonPermittedException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
@RestControllerAdvice
@Slf4j
@Component
public class GlobalExceptionHandler {

    @ExceptionHandler(ObjectValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ExceptionResponse handle(ObjectValidationException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg("Object not valid")
                .errorSource(exp.getViolationSource())
                .validationErrors(exp.getViolations())
                .build();
    }
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionResponse handle(EntityNotFoundException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg(exp.getMessage())
                .build();
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionResponse handle(UsernameNotFoundException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg(exp.getMessage())
                .build();
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionResponse handle(BadCredentialsException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg("Username and / or password is incorrect")
                .build();
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ExceptionResponse handle(AccessDeniedException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg("Access denied")
                .build();
    }

    @ExceptionHandler(DisabledException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionResponse handle() {
        return ExceptionResponse
                .builder()
                .errorMsg("The user is disabled. Please contact the admin")
                .build();
    }
    @ExceptionHandler(OperationNonPermittedException.class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    public ExceptionResponse handle(OperationNonPermittedException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg(exp.getMessage())
                .build();
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ExceptionResponse handle(DataIntegrityViolationException exp) {
        log.warn("Data integrity violation: {}", exp.getMessage());
        return ExceptionResponse
                .builder()
                .errorMsg("This operation conflicts with existing data (e.g. a duplicate or invalid reference)")
                .build();
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ExceptionResponse handle(MethodArgumentTypeMismatchException exp) {
        return ExceptionResponse
                .builder()
                .errorMsg("Invalid value for parameter '" + exp.getName() + "': " + exp.getValue())
                .build();
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ExceptionResponse handle(Exception exp) {
        // log
        log.error("Error occurred: ", exp);
        return ExceptionResponse
                .builder()
                .errorMsg("Oups, an error has occurred. Please contat tbe admin")
                .build();
    }

}
