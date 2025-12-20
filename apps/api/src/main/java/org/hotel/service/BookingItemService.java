package org.hotel.service;

import java.util.Optional;
import org.hotel.domain.BookingItem;
import org.hotel.repository.BookingItemRepository;
import org.hotel.service.dto.BookingItemDTO;
import org.hotel.service.mapper.BookingItemMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link org.hotel.domain.BookingItem}.
 */
@Service
@Transactional
public class BookingItemService {

    private static final Logger LOG = LoggerFactory.getLogger(BookingItemService.class);

    private final BookingItemRepository bookingItemRepository;

    private final BookingItemMapper bookingItemMapper;

    public BookingItemService(BookingItemRepository bookingItemRepository, BookingItemMapper bookingItemMapper) {
        this.bookingItemRepository = bookingItemRepository;
        this.bookingItemMapper = bookingItemMapper;
    }

    /**
     * Save a bookingItem.
     *
     * @param bookingItemDTO the entity to save.
     * @return the persisted entity.
     */
    public BookingItemDTO save(BookingItemDTO bookingItemDTO) {
        LOG.debug("Request to save BookingItem : {}", bookingItemDTO);
        BookingItem bookingItem = bookingItemMapper.toEntity(bookingItemDTO);
        bookingItem = bookingItemRepository.save(bookingItem);
        return bookingItemMapper.toDto(bookingItem);
    }

    /**
     * Update a bookingItem.
     *
     * @param bookingItemDTO the entity to save.
     * @return the persisted entity.
     */
    public BookingItemDTO update(BookingItemDTO bookingItemDTO) {
        LOG.debug("Request to update BookingItem : {}", bookingItemDTO);
        BookingItem bookingItem = bookingItemMapper.toEntity(bookingItemDTO);
        bookingItem = bookingItemRepository.save(bookingItem);
        return bookingItemMapper.toDto(bookingItem);
    }

    /**
     * Partially update a bookingItem.
     *
     * @param bookingItemDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<BookingItemDTO> partialUpdate(BookingItemDTO bookingItemDTO) {
        LOG.debug("Request to partially update BookingItem : {}", bookingItemDTO);

        return bookingItemRepository
            .findById(bookingItemDTO.getId())
            .map(existingBookingItem -> {
                bookingItemMapper.partialUpdate(existingBookingItem, bookingItemDTO);

                return existingBookingItem;
            })
            .map(bookingItemRepository::save)
            .map(bookingItemMapper::toDto);
    }

    /**
     * Get all the bookingItems.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<BookingItemDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all BookingItems");
        return bookingItemRepository.findAll(pageable).map(bookingItemMapper::toDto);
    }

    /**
     * Get all the bookingItems with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<BookingItemDTO> findAllWithEagerRelationships(Pageable pageable) {
        return bookingItemRepository.findAllWithEagerRelationships(pageable).map(bookingItemMapper::toDto);
    }

    /**
     * Get one bookingItem by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<BookingItemDTO> findOne(Long id) {
        LOG.debug("Request to get BookingItem : {}", id);
        return bookingItemRepository.findOneWithEagerRelationships(id).map(bookingItemMapper::toDto);
    }

    /**
     * Delete the bookingItem by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete BookingItem : {}", id);
        bookingItemRepository.deleteById(id);
    }
}
