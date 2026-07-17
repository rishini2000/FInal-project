package lk.deenproject.item.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.deenproject.item.entity.Item;

public interface ItemRepository extends JpaRepository<Item, Integer> {

    @Query(value = "SELECT i FROM Item i WHERE i.itemcode=:itemcode")
    Item getByItemcode(@Param("itemcode") String itemcode);

    @Query(value = "SELECT i FROM Item i WHERE i.item_name=:item_name")
    Item getByItemname(@Param("item_name") String item_name);

}
