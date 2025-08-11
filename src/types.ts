export type Status = "FOUND" | "STORED" | "CLAIMED";

export type Item = {
  id: string;
  title: string;
  category: string;
  description?: string;
  locationFound: string;
  dateFound: string; // ISO yyyy-mm-dd
  storageLocation: string;
  reporter: string;
  imageUrl?: string;
  status: Status;
  shelfCode?: string;
  dateStored?: string; // ISO
  storedBy?: string;
  claimer?: string;
  dateClaimed?: string; // ISO
  finderName?: string;
  finderContact?: string;
  finderNote?: string;
  dateHandover?: string; // ISO
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
  createdBy: string;
  itemId?: string;
};
