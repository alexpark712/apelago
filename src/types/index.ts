export type ItemStatus = 'open' | 'claimed' | 'done';

export interface Item {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  minPrice: number;
  pickupByBuyer: boolean;
  status: ItemStatus;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  claimedBy?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  interestedSellers?: InterestedSeller[];
  createdAt: Date;
  claimedAt?: Date;
}

export interface InterestedSeller {
  sellerId: string;
  sellerName: string;
  interestedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'seller';
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  sellingProofUrl?: string;
  location?: string;
  claimedItemId?: string;
}

export interface RulesConfirmation {
  userId: string;
  itemId: string;
  confirmedAt: Date;
}
