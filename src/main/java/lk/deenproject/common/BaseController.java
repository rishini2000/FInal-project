package lk.deenproject.common;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.servlet.ModelAndView;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

public abstract class BaseController<T, ID> {

    @PersistenceContext
    private EntityManager entityManager;

    protected abstract JpaRepository<T, ID> getRepository();

    protected abstract String getEntityName();

    protected String generateCode(String tableName, String columnName, String prefix) {
        try {
            Object result = entityManager.createNativeQuery(
                "SELECT MAX(CAST(SUBSTRING(" + columnName + ", " + (prefix.length() + 1) + ") AS UNSIGNED)) " +
                "FROM " + tableName + " WHERE " + columnName + " LIKE :pattern"
            ).setParameter("pattern", prefix + "%").getSingleResult();

            int nextNumber = 1;
            if (result != null) {
                nextNumber = ((Number) result).intValue() + 1;
            }

            Object maxCode = entityManager.createNativeQuery(
                "SELECT MAX(" + columnName + ") FROM " + tableName + " WHERE " + columnName + " LIKE :pattern"
            ).setParameter("pattern", prefix + "%").getSingleResult();

            int padding = 3;
            if (maxCode != null) {
                String maxCodeStr = maxCode.toString();
                int numericPartLength = maxCodeStr.length() - prefix.length();
                if (numericPartLength > 0) {
                    padding = numericPartLength;
                }
            }

            return prefix + String.format("%0" + padding + "d", nextNumber);
        } catch (Exception e) {
            Long count = getRepository().count();
            return prefix + String.format("%03d", count + 1);
        }
    }

    protected ModelAndView createPageView() {
        ModelAndView mv = new ModelAndView();
        mv.setViewName(getEntityName() + ".html");
        mv.addObject("currentPage", getEntityName());
        return mv;
    }

    protected List<T> findAll() {
        return getRepository().findAll();
    }

    protected boolean existsById(ID id) {
        return getRepository().findById(id).isPresent();
    }

    protected String success() {
        return "OK";
    }

    protected String error(String operation, String reason) {
        return capitalize(getEntityName()) + " " + operation + " failed: " + reason;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}
