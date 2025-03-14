export interface Donor {
  _id: string;
  name: string;
  email: string;
}

export interface Donation {
  _id: string;
  food_type: string;
  donation_description: string;
  quantity: number;
  image_url: string[];
  volunteer_pool_size: number;
  claimed_volunteers_count: number;
  pickup_address: string;
  expiry_date: string;
  status: string;
  donor: Donor;
  createdAt: string;
}

export interface ClaimDonation {
  _id: string;
  food_type: string;
  donation_description: string;
  image_url: string[];
  pickup_address: string;
  expiry_date: string;
}

export interface Claim {
  _id: string;
  donation: ClaimDonation;
  donor_request_status: string;
  shelter_request_status: string;
  donor: Donor;
  createdAt: string;
}
