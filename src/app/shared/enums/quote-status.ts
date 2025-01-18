export enum QuoteStatus {
  draft = 'draft',
  // pending_approval = 'pending approval',
  pending_approval = 'pending_approval',
  approved = 'approved',
  accepted = 'accepted',
  rejected = 'rejected',
}

export enum RejectReasons {
    expensive = 'Too expensive',
    delivery_late = 'The expected delivery date is too late',
    no_stock = 'No stock'
}