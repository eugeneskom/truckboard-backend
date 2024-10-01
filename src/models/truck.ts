export interface Truck {
  id?: number;
  truck_number: string;
  carrier_number: string;
  truck_type: string;
  truck_dims: string;
  payload: number;
  accessories: string[] | string; // array when received from client, string when stored in DB
  driver_number: string;
  Driver_name: string;
}