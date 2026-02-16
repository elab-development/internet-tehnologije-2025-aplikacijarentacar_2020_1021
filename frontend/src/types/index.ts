export interface Vehicle {
  id: number
  brand: string
  model: string
  price_per_day: number
  available: boolean
}

export interface VehicleListResponse {
  status: string
  data: Vehicle[]
}

export interface UserInReview {
  full_name: string
}

export interface VehicleInReview {
  id: number
  brand: string
  model: string
}

export interface ReviewData {
  id: number
  rating: number
  comment: string
  user: UserInReview
  vehicle: VehicleInReview
}

export interface ReviewListResponse {
  status: string
  data: ReviewData[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RoleResponse {
  id: number
  name: string
}

export interface UserResponse {
  id: number
  email: string
  phone_number: string
  role: RoleResponse
  is_active: boolean
  created_at: string
}

export interface VehicleCreatePayload {
  brand: string
  model: string
  price_per_day: number
  available: boolean
}

export interface ReservationCreatePayload {
  vehicle_id: number
  start_date: string
  end_date: string
}

export interface UserInReservation {
  id: number
  full_name: string
  email: string
  phone_number: string
}

export interface VehicleInReservation {
  id: number
  brand: string
  model: string
  price_per_day: number
}

export interface ReservationResponse {
  id: number
  start_date: string
  end_date: string
  price: number
  status: string
  user: UserInReservation
  vehicle: VehicleInReservation
}

export interface ReservationListResponse {
  status: string
  data: ReservationResponse[]
}

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed' | 'payment_processed'

export interface UserAdminPanel {
  id: number
  full_name: string
  email: string
  phone_number: string
  role: RoleResponse
  is_active: boolean
}

export type StatsTimeframe = 'today' | 'last_7_days' | 'last_30_days' | 'all_time'

export interface StatsCounters {
  reservations: { all_time: number; last_30_days: number; last_7_days: number; today: number }
  users: { all_time: number; last_30_days: number; last_7_days: number; today: number }
  revenue: {
    total_all_time: number
    last_30_days: number
    last_7_days: number
    today: number
  }
  total_vehicles: number
}

export interface AdminStatsResponse {
  status: string
  data: {
    counters: StatsCounters
    charts: {
      revenue_history: Array<{ month: string; revenue: number }>
      top_vehicles: Array<{ name: string; rentals: number }>
    }
  }
}
