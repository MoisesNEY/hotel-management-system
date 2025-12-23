package org.hotel.repository;

import java.util.List;
import java.util.Optional;
import jakarta.validation.constraints.NotNull;
import org.hotel.domain.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {
    default Optional<Room> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }
    default List<Room> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }
    default Page<Room> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select room from Room room left join fetch room.roomType", countQuery = "select count(room) from Room room")
    Page<Room> findAllWithToOneRelationships(Pageable pageable);

    @Query("select room from Room room left join fetch room.roomType")
    List<Room> findAllWithToOneRelationships();

    @Query("select room from Room room left join fetch room.roomType where room.id =:id")
    Optional<Room> findOneWithToOneRelationships(@Param("id") Long id);
    long countByRoomTypeId(Long roomTypeId);

    boolean existsByRoomNumber(@NotNull String roomNumber);

    boolean existsByRoomNumberAndIdNot(@NotNull String roomNumber, Long id);

    @Query("""
        SELECT COUNT(bi) > 0\s
        FROM BookingItem bi\s
        JOIN bi.booking b\s
        WHERE bi.assignedRoom.id = :roomId\s
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
   \s""")
    boolean existsActiveBookingForRoom(@Param("roomId") Long roomId);
}
