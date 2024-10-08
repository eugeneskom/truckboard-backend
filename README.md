## truckboard-backend

## Database Relationships

### Carrier and Driver
- One carrier can have multiple drivers
- Relationship: One-to-Many
- Foreign Key: `carrier_number` in the `Driver` table

### Carrier and Truck
- One carrier can have multiple trucks
- Relationship: One-to-Many
- Foreign Key: `carrier_number` in the `Truck` table

### Driver and Truck
- One driver can be associated with one truck (assuming one driver per truck)
- Relationship: One-to-One
- Foreign Key: `driver_number` in the `Truck` table

### SearchItem and RateItem
- One search can have multiple rates
- Relationship: One-to-Many
- Foreign Key: `search_number` in the `RateItem` table

### SearchItem and Truck
- One search can involve multiple trucks, and one truck can be involved in multiple searches
- Relationship: Many-to-Many
- This requires a junction table, let's call it `search_truck`

### Agent (Future Table)
- One agent can be associated with multiple carriers
- Relationship: One-to-Many
- Foreign Key: `agent_number` in the `Carrier` table