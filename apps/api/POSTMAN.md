POST http://localhost:8080/api/room-types

{
  "name": "Deluxe Suite",
  "description": "Habitación amplia con vista al mar y balcón privado.",
  "basePrice": 150.00,
  "maxCapacity": 4,
  "imageUrl": "https://www.hotelborobudur.com/wp-content/uploads/2025/05/New-deluxe-suite-bedroom2-Edit-copy-scaled.jpg",
  "area": 45.5,
  "beds": 2
}


## METODO DE AUTENTICACION CON ADMIN
POST http://localhost:9080/realms/hotel/protocol/openid-connect/token

![alt text](image.png)


POST http://localhost:8080/api/bookings
{
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-25",
  "guestCount": 2,
  "status": "PENDING",
  "totalPrice": 450.00,
  "notes": "Reserva para vacaciones"
}

/api/rooms
