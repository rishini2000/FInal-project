package lk.deenproject.item.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.deenproject.enums.ItemCategory;
import lk.deenproject.enums.ItemSize;
import lk.deenproject.enums.ItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "item")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String itemcode;
    @NotBlank
    @Size(min = 2, max = 100)
    private String item_name;
    private String note;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "item_category")
    private ItemCategory itemCategory;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "item_status")
    private ItemStatus itemStatus;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "item_size")
    private ItemSize itemSize;

    @Column(name = "rental_price")
    private BigDecimal rental_price;

    @Column(name = "key_money")
    private BigDecimal key_money;
}
