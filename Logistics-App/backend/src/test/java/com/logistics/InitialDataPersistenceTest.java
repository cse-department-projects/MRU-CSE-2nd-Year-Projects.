package com.logistics;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.SpringBootTest;

import com.logistics.repository.DriverRepository;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.UserRepository;
import com.logistics.repository.VehicleRepository;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:initial-data-persistence;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class InitialDataPersistenceTest {

    @Autowired
    private CommandLineRunner seedData;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void startupDoesNotRestoreEditedOrDeletedData() throws Exception {
        var vehicle = vehicleRepository.findAll().get(0);
        vehicle.setVehicleNumber("CUSTOM-VEHICLE");
        vehicleRepository.save(vehicle);

        seedData.run();

        assertEquals("CUSTOM-VEHICLE",
                vehicleRepository.findById(vehicle.getId()).orElseThrow().getVehicleNumber());
        assertEquals(3, vehicleRepository.count());

        shipmentRepository.deleteAll();
        driverRepository.deleteAll();
        vehicleRepository.deleteAll();
        userRepository.deleteAll();

        seedData.run();

        assertEquals(0, shipmentRepository.count());
        assertEquals(0, driverRepository.count());
        assertEquals(0, vehicleRepository.count());
        assertEquals(0, userRepository.count());
    }
}
