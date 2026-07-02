package com.bank.banking.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatisticsResponse {

    private BigDecimal highestTransfer;
    private BigDecimal highestDeposit;
    private BigDecimal accountBalance;
}
