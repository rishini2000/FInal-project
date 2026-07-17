package lk.deenproject.item.controller;

import java.util.Arrays;
import java.util.List;
import lk.deenproject.enums.ItemCategory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ItemCategoryController {

    @GetMapping("/itemcategory/alldata")
    public List<ItemCategory> getAllCategories() {
        return Arrays.asList(ItemCategory.values());
    }

}
