package com.bank.banking.Services.impl;

import com.bank.banking.Services.AccountService;
import com.bank.banking.dto.AccountDto;
import com.bank.banking.exceptions.OperationNonPermittedException;
import com.bank.banking.repositories.AccountRepository;
import com.bank.banking.repositories.UserRepository;
import com.bank.banking.validator.ObjectsValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.iban4j.CountryCode;
import org.iban4j.Iban;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository repository;
    private final UserRepository userRepository;
    private final ObjectsValidator<AccountDto> validator;

    @Override
    public Integer create(AccountDto accountDto) {
        validator.validate( accountDto );

        if (!userRepository.existsById(accountDto.getUserId())) {
            throw new EntityNotFoundException("No user found with the ID: " + accountDto.getUserId());
        }

        var userHasAlreadyAnAccount=repository.existsByUserId( accountDto.getUserId() );
        if(userHasAlreadyAnAccount){
          throw new OperationNonPermittedException("User already has account");
        }

        var account=AccountDto.ToEntity( accountDto );
        account.setIban(generateRandomIban());
        return repository.save(account).getId();
    }

    @Override
    public List<AccountDto> findAll() {
        return  repository.findAll().stream()
                .map(AccountDto::FromEntity )
                .collect( Collectors.toList());
    }

    @Override
    public AccountDto findById(Integer id) {
        return repository.findById( id )
                .map( AccountDto::FromEntity )
                .orElseThrow( ()->new EntityNotFoundException("No account found : "+id) );
    }

    @Override
    public void delete(Integer id) {
   repository.deleteById( id );
    }

    private String generateRandomIban() {
        var iban = Iban.random( CountryCode.TN).toFormattedString();
        // regenerate on collision instead of returning the duplicate
        while (repository.existsByIban(iban)) {
            iban = Iban.random( CountryCode.TN).toFormattedString();
        }
        return iban;
    }


}
