package com.campuslost.controller;

import com.campuslost.model.LostItem;
import com.campuslost.repository.LostItemRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LostItemController {
    private final LostItemRepository repository;

    public LostItemController(LostItemRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<LostItem> getAllItems() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public LostItem getItem(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LostItem createItem(@Valid @RequestBody LostItem item) {
        item.setId(null);
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public LostItem updateItem(@PathVariable Long id, @Valid @RequestBody LostItem updated) {
        LostItem item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
        item.setTitle(updated.getTitle());
        item.setDescription(updated.getDescription());
        item.setCategory(updated.getCategory());
        item.setLocation(updated.getLocation());
        item.setContactName(updated.getContactName());
        item.setContactEmail(updated.getContactEmail());
        item.setItemType(updated.getItemType());
        item.setStatus(updated.getStatus());
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found");
        }
        repository.deleteById(id);
    }
}
