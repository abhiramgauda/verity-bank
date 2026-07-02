package com.bank.banking.dto;


import com.bank.banking.models.Account;
import com.bank.banking.models.User;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountDto {
    private Integer id;
    private String iban;
    private String userFirstname;
    private String userLastname;
    @NotNull(message = "User should not be null")
    private Integer userId;
    public static Account ToEntity(AccountDto accountDto) {
        if (accountDto == null) {
            return new Account();
        }
        return Account.builder()
                .user(
                        User.builder()
                                .id(accountDto.getUserId())
                                .build()
                )
                .build();
    }

    public static AccountDto FromEntity(Account account) {
        return AccountDto.builder()
                .id(account.getId())
                .iban(account.getIban())
                .userFirstname(account.getUser().getFirstName())
                .userLastname(account.getUser().getLastName())
                .userId(account.getUser().getId())
                .build();
    }
}
