export interface Country {
  id: string;
  name: string;
  isoCode: string;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  communityId: string;
}
