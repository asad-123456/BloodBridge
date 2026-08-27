export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel = 'Routine' | 'Today' | 'Urgent';
export type TrustLabel = 'Self-verified' | 'Institution-backed' | 'Partner fulfillment';
export type RequestStatus =
| 'Draft'
| 'Pending hospital verification'
| 'Active'
| 'Matched / In progress'
| 'Fulfilled'
| 'Closed'
| 'Cancelled'
| 'Expired';

export interface BloodRequest {
id: string;
requesterId: string;
hospitalName: string;
isHospitalRegistered: boolean;
bloodGroup: BloodGroup;
unitsRequired: number;
unitsFulfilled: number;
unitsRemaining: number;
urgency: UrgencyLevel;
requiredBy: string;
status: RequestStatus;
trustLabel: TrustLabel;
shortNote?: string;
distanceKm?: number;
createdAt: string;
latestVerification?: {
verifiedBy: string;
timestamp: string;
note?: string;
};
}
