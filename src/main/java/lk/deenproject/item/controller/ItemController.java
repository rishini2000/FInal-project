package lk.deenproject.item.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.common.BaseController;
import lk.deenproject.item.entity.Item;
import lk.deenproject.item.repository.ItemRepository;

@RestController
public class ItemController extends BaseController<Item, Integer> {

    @Autowired
    private ItemRepository itemDao;

    @Override
    protected ItemRepository getRepository() {
        return itemDao;
    }

    @Override
    protected String getEntityName() {
        return "item";
    }

    @RequestMapping("/item")
    public org.springframework.web.servlet.ModelAndView itemPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('ITEM_SELECT')")
    @GetMapping(value = "/item/alldata", produces = "application/json")
    public List<Item> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('ITEM_INSERT')")
    @PostMapping(value = "/item/insert", produces = "application/json")
    public String saveData(@Valid @RequestBody Item item) {
        Item existingItemByName = itemDao.getByItemname(item.getItem_name());
        if (existingItemByName != null) {
            return error("save", "Item already exists for the given item name.");
        }

        try {
            item.setItemcode(generateCode("item", "itemcode", "ITM"));
            itemDao.save(item);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ITEM_UPDATE')")
    @PutMapping(value = "/item/update", produces = "application/json")
    public String updateData(@Valid @RequestBody Item item) {
        Item existingItem = itemDao.getReferenceById(item.getId());
        if (existingItem == null) {
            return error("update", "Item not found.");
        }

        Item existingItemByCode = itemDao.getByItemcode(item.getItemcode());
        if (existingItemByCode != null && !existingItemByCode.getId().equals(item.getId())) {
            return error("update", "Item already exists for the given item code.");
        }

        Item existingItemByName = itemDao.getByItemname(item.getItem_name());
        if (existingItemByName != null && !existingItemByName.getId().equals(item.getId())) {
            return error("update", "Item already exists for the given item name.");
        }

        try {
            itemDao.save(item);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('ITEM_DELETE')")
    @DeleteMapping(value = "/item/delete", produces = "application/json")
    public String deleteData(@RequestBody Item item) {
        Item existingItem = itemDao.getReferenceById(item.getId());
        if (existingItem == null) {
            return error("delete", "Item not found.");
        }

        try {
            itemDao.delete(existingItem);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
