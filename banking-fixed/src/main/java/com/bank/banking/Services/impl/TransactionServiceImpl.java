package com.bank.banking.Services.impl;

import com.bank.banking.Services.TransactionService;
import com.bank.banking.dto.TransactionDto;
import com.bank.banking.models.Account;
import com.bank.banking.models.Transaction;
import com.bank.banking.models.TransactionType;
import com.bank.banking.repositories.AccountRepository;
import com.bank.banking.repositories.TransactionRepository;
import com.bank.banking.validator.ObjectsValidator;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final ObjectsValidator<TransactionDto> validator ;

    @Override
    @Transactional
    public Integer create(TransactionDto transactionDto) {
        validator.validate( transactionDto );

        // for transfers, resolve the destination account up front so a transfer to a
        // non-existent IBAN fails before any money leaves the sender's account
        Account destinationAccount = null;
        if (transactionDto.getType() == TransactionType.TRANSFERT) {
            destinationAccount = accountRepository.findByIban(transactionDto.getDestinationIban())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No account found with IBAN: " + transactionDto.getDestinationIban()));
        }

        var transaction = TransactionDto.toEntity( transactionDto );
        var multiplier = BigDecimal.valueOf(getTransactionMultiplier(transactionDto.getType()));
        var amountToSave = transactionDto.getAmount().multiply( multiplier );
        transaction.setAmount( amountToSave );
        var savedId = transactionRepository.save( transaction ).getId();

        // credit the recipient so transfers actually move money instead of vanishing
        if (destinationAccount != null) {
            var creditTransaction = Transaction.builder()
                    .amount(transactionDto.getAmount())
                    .destinationIban(transactionDto.getDestinationIban())
                    .type(TransactionType.DEPOSIT)
                    .transactionDate(LocalDate.now())
                    .user(destinationAccount.getUser())
                    .build();
            transactionRepository.save(creditTransaction);
        }

        return savedId;
    }

    @Override
    public List<TransactionDto> findAllByUser(Integer userId) {
        return transactionRepository.findAllByUserId( userId )
                .stream().map( TransactionDto::fromEntity )
                .collect( Collectors.toList());
    }

    @Override
    public int getTransactionMultiplier(TransactionType type) {
            return  TransactionType.TRANSFERT == type ? -1 : 1;
    }
}
